import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Prompts moved from Azure Functions
const fishNameSystemPrompt = `
You are an expert marine biologist AI that analyzes fish images with maximum accuracy. 

When provided with a fish image, identify the most likely species with the highest possible precision. 

Respond ONLY with the following exact JSON format:
{"fishName": "Common name of the fish"}

Guidelines:
- Use the common name of the most prominent fish visible in the image.
- If uncertain, still provide the most likely name but ensure accuracy remains a priority.
- Base your identification on distinctive features, coloration, shape, and patterns.
- Cross-reference with reputable marine biology sources to ensure correctness.
- No extra text or formatting — only the JSON response exactly as shown.
`;

const imageEnrichementSystemPrompt = `
    You are an expert marine biologist AI that analyzes fish images and provides detailed, structured information. 

    When provided with a fish image, analyze it thoroughly and respond with exactly the following JSON structure. 

    Ensure all measurements are in appropriate units (cm for size, meters for depth) and provide accurate scientific information. 

    Respond with this exact JSON format: {"fishData": {"name": "Common name of the fish", "family": "Scientific family name", "minSize": 0, "maxSize": 0, "waterType": "Freshwater|Saltwater|Brackish", "description": "Detailed description of the fish's physical characteristics, behavior, and habitat preferences", "colorDescription": "Detailed description of the fish's coloration and patterns", "depthRangeMin": 0, "depthRangeMax": 0, "environment": "Specific habitat description (coral reefs, rocky shores, open ocean, etc.)", "region": "Geographic distribution/native regions", "conservationStatus": "Least Concern|Near Threatened|Vulnerable|Endangered|Critically Endangered|Extinct in the Wild|Extinct|Data Deficient", "consStatusDescription": "Brief explanation of conservation status and threats", "aiAccuracy": 0}, "colors": [{"colorName": "Primary color 1"}, {"colorName": "Primary color 2"}], "predators": [{"predatorName": "Natural predator 1"}, {"predatorName": "Natural predator 2"}], "funFacts": [{"funFactDescription": "Interesting fact about the fish's behavior, abilities, or characteristics"}, {"funFactDescription": "Another fascinating fact about this species"}]}

    Requirements: minSize and maxSize must be in centimeters for typical adult specimens. 

    depthRangeMin and depthRangeMax must be in meters, use 0 for surface-dwelling species. 

    conservationStatus must be exactly one of these values: "Least Concern", "Near Threatened", "Vulnerable", "Endangered", "Critically Endangered", "Extinct in the Wild", "Extinct", "Data Deficient". 

    aiAccuracy should be a number from 0-100 based on image clarity, distinctive features visible, certainty of species identification, and whether it's a common or rare species. 

    colors array should list 2-4 primary colors using descriptive but concise color names, include patterns if distinctive. 

    predators array should list 2-4 main natural predators using common names. 

    funFacts array should provide 2-4 interesting facts focusing on unique behaviors, abilities, or characteristics, keep each fact concise but informative. 

    description should be 100-200 words covering physical characteristics, behavior, diet, and habitat. 

    colorDescription should focus specifically on coloration, patterns, and color variations. 

    consStatusDescription should explain current conservation status and main threats. 

    If the image is unclear or you're uncertain about species identification, reflect this in the aiAccuracy score. 

    For schooling fish, provide data for individual specimens, not the group. 

    If multiple species are visible, identify the most prominent/clear specimen. 

    Use metric units consistently and ensure waterType matches the species' natural habitat requirements. 

    Identify the species as accurately as possible, assess image quality and visible features for accuracy rating, cross-reference reliable sources for data consistency, prioritize accuracy over speed, use scientific data from reputable marine biology sources, and consider regional variations in size, color, and habitat.
`;

async function saveImageLocally(imageBuffer: ArrayBuffer, deviceId: string): Promise<string> {
  const storagePath = Bun.env.STORAGE_PATH || './uploads';
  const uploadDir = `${storagePath}/fish-images/${deviceId}`;
  
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  // TODO: Optimize images before saving to reduce storage space.
  // Consider resizing large images and compressing them while maintaining quality.
  // You may want to use the 'sharp' library that's already in dependencies.
  // YOU NEED TO IMPLEMENT THIS HERE
  // Currently saves image as-is without optimization
  
  const fileName = `${Date.now()}_${crypto.randomUUID()}.jpg`;
  const filePath = `${uploadDir}/${fileName}`;
  await writeFile(filePath, Buffer.from(imageBuffer));
  
  // Return path relative to storage root for API serving
  return `${deviceId}/${fileName}`;
}

function cleanJsonResponse(response: string): string {
  // TODO: Clean AI responses that may be wrapped in markdown code blocks.
  // The AI sometimes returns JSON wrapped in ```json blocks that need to be removed before parsing.
  // YOU NEED TO IMPLEMENT THIS HERE
  // Currently returns response as-is - may fail if wrapped in markdown
  let cleaned = response.trim();

  if(cleaned.startsWith("```json ")){
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  }
  else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

export async function processFishImageSimple(
  imageBuffer: ArrayBuffer,
  deviceId: string
): Promise<void> {
  const apiBaseUrl = Bun.env.API_BASE_URL || 'http://localhost:3000/api';
  
  const openai = new OpenAI({
    apiKey: Bun.env.OPENAI_API_KEY,
  });

  if (!Bun.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not configured');
    throw new Error('OpenAI API key not configured');
  }

  // Convert image to base64
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

  try {
    // Step 1: Get fish name
    console.log('Step 1: Getting fish name from image...');
    const nameResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: fishNameSystemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the fish species in this image." },
            { type: "image_url", image_url: { url: imageDataUrl } }
          ]
        }
      ],
      max_tokens: 100,
      temperature: 0.1
    });

    const nameContent = nameResponse.choices[0].message.content;
    if (!nameContent) {
      throw new Error('No response from OpenAI for fish name');
    }

    const cleanedNameResponse = cleanJsonResponse(nameContent);
    const nameData = JSON.parse(cleanedNameResponse);
    const fishName = nameData.fishName;

    if (!fishName) {
      throw new Error('No fish name found in AI response');
    }

    console.log(`Identified fish name: ${fishName}`);

    // Step 2: Check if fish exists
    console.log('Step 2: Checking if fish already exists...');
    const checkResponse = await fetch(`${apiBaseUrl}/fish/name/${encodeURIComponent(fishName)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!checkResponse.ok) {
      throw new Error(`HTTP error checking fish name! status: ${checkResponse.status}`);
    }

    const checkResult = await checkResponse.json();
    console.log('Fish check result:', checkResult);

    // Save image locally
    const imageUrl = await saveImageLocally(imageBuffer, deviceId);

    if (checkResult.success && checkResult.data.known) {
      // Existing fish - just add to device
      console.log(`Fish "${fishName}" is already known, adding to device`);
      
      const addExistingResponse = await fetch(`${apiBaseUrl}/fish/add-existing/${deviceId}/${fishName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (!addExistingResponse.ok) {
        const errorText = await addExistingResponse.text();
        console.error('Warning: Add existing fish request failed:', addExistingResponse.status, errorText);
      } else {
        const addResult = await addExistingResponse.json();
        const skipped = addResult?.data?.skipped === true;
        if (skipped) {
          console.log('Existing fish sighting skipped to avoid spamming (seen within 10 seconds).');
        } else {
          console.log('Successfully added existing fish to device');
        }
      }
      return;
    }

    // Step 3: New fish - get full details
    console.log('Step 3: Fish is not known, proceeding with full enrichment...');
    const enrichmentResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: imageEnrichementSystemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this fish image and provide the structured data as requested." },
            { type: "image_url", image_url: { url: imageDataUrl } }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.3
    });

    const enrichmentContent = enrichmentResponse.choices[0].message.content;
    if (!enrichmentContent) {
      throw new Error('No response from OpenAI for fish enrichment');
    }

    const cleanedEnrichmentResponse = cleanJsonResponse(enrichmentContent);
    console.log('Cleaned enrichment response:', cleanedEnrichmentResponse);
    const enrichmentData = JSON.parse(cleanedEnrichmentResponse);
    
    // TODO: Extract fish data from the AI response structure.
    // The AI may return data in different formats - ensure you handle the response structure correctly.
    // The response might have fishData nested, or it might be flat. Handle both cases.
    // YOU NEED TO IMPLEMENT THIS HERE
    
    // PLACEHOLDER: Assume flat structure - may fail if nested
    const fishData = enrichmentData.fishData || enrichmentData;
    if (!fishData || typeof fishData !== 'object') {
      throw new Error('YOU NEED TO IMPLEMENT PROPER DATA EXTRACTION FROM AI RESPONSE');
    }

    // Step 4: Register fish and add to device
    console.log("Sending new fish data to API for registration");
    const registerResponse = await fetch(`${apiBaseUrl}/fish/process-fish-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fishData })
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      throw new Error(`HTTP error registering fish! status: ${registerResponse.status}, body: ${errorText}`);
    }

    const fishResponse = await registerResponse.json();
    
    if (fishResponse.success && fishResponse.data) {
      // Step 5: Add to device
      const currentTime = new Date().toISOString();
      
      const devicePayload = {
        fishName: fishResponse.data.name,
        fish: fishResponse.data,
        imageUrl: imageUrl,
        timestamp: currentTime,
        fishId: fishResponse.data._id
      };

      console.log("Sending new fish data to device endpoint");
      const deviceResponse = await fetch(`${apiBaseUrl}/device/${deviceId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devicePayload)
      });

      if (!deviceResponse.ok) {
        const errorText = await deviceResponse.text();
        console.error('Warning: Device endpoint request failed:', deviceResponse.status, errorText);
      } else {
        console.log('Successfully added new fish to device');
      }
    }
  } catch (error) {
    // TODO: Implement proper error handling for the image processing pipeline.
    // Consider what should happen if OpenAI API calls fail, if image saving fails, or if API calls to register fish fail.
    // Should you retry? Should you log specific errors? Should you notify the user?
    // YOU NEED TO IMPLEMENT THIS HERE
    
    console.error('Error in fish enrichment process - YOU NEED TO IMPLEMENT PROPER ERROR HANDLING:', error);
    // PLACEHOLDER: Just throw error - proper error handling needed
    throw new Error(`Image processing failed - YOU NEED TO IMPLEMENT PROPER ERROR HANDLING: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

