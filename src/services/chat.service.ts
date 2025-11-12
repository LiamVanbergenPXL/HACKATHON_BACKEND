import { Device } from "../db/models";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../lib/mongooseResponseFormatter";
import OpenAI from 'openai';
import sanitizeHtml from 'sanitize-html';

export async function getFishDataAndChat(deviceIdentifier: string, userMessage: string): Promise<ApiResponse<any>> {
  try {
    // TODO: Validate the user message before processing.
    // Check if the message is not empty, not too long, and contains valid content.
    // Return appropriate error messages for invalid input.
    // YOU NEED TO IMPLEMENT THIS HERE
    
    // PLACEHOLDER: Basic check only
    const MAX_MESSAGE_LENGTH = 1000;
    if (!userMessage || userMessage.trim().length === 0) {
      return createErrorResponse({ code: 'INVALID_INPUT', field: 'userMessage' }, 'Message cannot be empty');
    }
    if(userMessage.length > MAX_MESSAGE_LENGTH){
      return createErrorResponse({ code: 'INVALID_INPUT', field: 'userMessage' }, `Message is larger then ${MAX_MESSAGE_LENGTH}`)
    }
    const cleanMessage = sanitizeHtml(userMessage,{
      allowedTags: [],
      allowedAttributes: {}
    });
    if (cleanMessage !== userMessage) {
      return createErrorResponse({ code: 'INVALID_INPUT' }, 'Invalid characters detected.');
    }

    // Get device and populate fish data
    const device = await Device.findOne({ deviceIdentifier }).populate('fish.fish');
    
    if (!device) {
      return createErrorResponse({ message: 'Device not found' }, 'Device has not been registered yet');
    }

    if (!device.fish || device.fish.length === 0) {
      return createErrorResponse({ message: 'No fish data found for this device' }, 'No fish data available');
    }

    // TODO: Format fish data for the AI in a structured way that the AI can understand.
    // Extract relevant information from each fish entry and format it appropriately.
    // Consider what fields are most important for answering questions about the fish.
    // YOU NEED TO IMPLEMENT THIS HERE
    
    // PLACEHOLDER: Basic formatting - proper structure needed
      const fishData = device.fish.map(fishEntry => {
      // Assuming 'device.fish' has been populated, so 'fishEntry.fish'
      // is a full Fish document and not just an ObjectId.
      const fish = fishEntry.fish as any;

      // Handle cases where population might have failed or fish is null
      if (!fish) {
        return {
          name: "Unknown Fish",
          error: "Fish data was not properly populated."
        };
      }

      // TODO: Select and format the most relevant fish properties for the AI context
      // This structure maps your exact schema fields to a flat, readable object
      // for the AI context.
      return {
        name: fish.name || "Unknown",
        family: fish.family || "Unknown",

        // Combine min/max fields into meaningful ranges
        size_range_cm: { 
          min: fish.minSize, 
          max: fish.maxSize 
        },
        depth_range_m: { 
          min: fish.depthRangeMin, 
          max: fish.depthRangeMax 
        },

        // e.g., 'Freshwater', 'Saltwater', 'Brackish'
        water_type: fish.waterType || "Unknown", 
        
        // Combine related text fields for a fuller picture
        description: fish.description || "No description available.",
        appearance: fish.colorDescription || "No color description.",
        
        // Combine environment and region into a 'habitat' concept
        habitat: {
          environment: fish.environment, // e.g., "Coral reefs"
          region: fish.region         // e.g., "Indo-Pacific"
        },
        
        // Use the specific conservation status fields
        conservation_status: fish.conservationStatus,
        conservation_details: fish.consStatusDescription,

        // Include the timestamp from the specific device capture
        identified_on: fishEntry.timestamp,
      };
    });

    // Setup OpenAI client (standard OpenAI, not Azure)
    const apiKey = Bun.env.OPENAI_API_KEY;
    if (!apiKey) {
      return createErrorResponse({ message: 'OpenAI API key not configured' }, 'No OpenAI API key found. Please set OPENAI_API_KEY in your .env file');
    }

    const client = new OpenAI({
      apiKey: apiKey,
    });

    const modelName = "gpt-4o";

    // TODO: Create a system message that provides context to the AI about the detected fish.
    // The system message should include all relevant fish data in a format the AI can understand.
    // Consider how to structure the information clearly and what instructions to give the AI.
    // YOU NEED TO IMPLEMENT THIS HERE
    
    // PLACEHOLDER: Basic system message - proper context building needed
    const systemMessage = `
You are a specialized AI assistant for FishTracker. 
Your sole purpose is to answer questions based *only* on the fish detection data provided to you.

Here is the data for all fish detected by the user's device (in JSON format):
\`\`\`json
${JSON.stringify(fishData, null, 2)}
\`\`\`

---
**Your Instructions:**
1.  **Strictly On-Topic:** Only use the fish data provided above in the JSON block to answer the user.
2.  **Decline Off-Topic:** Politely decline any questions about other topics, general knowledge, or fish that are *not* in the list.
3.  **Be Conversational:** Answer the user's questions clearly and naturally. You can summarize data (e.g., "You have seen 3 fish total"), count fish, or describe specific fish based on the provided details.
4.  **Use Context:** You can use the "detectionTimestamp" to answer questions about *when* a fish was seen.
5.  **Do Not Mention "JSON":** Do not refer to "the JSON" or "the provided data" in your response. Speak as if you are the device's built-in assistant.

Example of a good response: "Your device has detected a Goldfish (seen on...) and a Clownfish (seen on...)."
Example of a bad (off-topic) response: "I'm sorry, I can only provide information about the fish detected by your device."
`;
    // Get AI response
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // TODO: Extract and validate the AI response properly.
    // Handle cases where the response might be null, empty, or malformed.
    // Consider what should happen if the AI doesn't return a valid response.
    // YOU NEED TO IMPLEMENT THIS HERE
    
    // PLACEHOLDER: Basic extraction - proper validation needed
    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return createErrorResponse({ message: 'AI response extraction not fully implemented - YOU NEED TO IMPLEMENT THIS HERE' }, 'No response received from AI');
    }

    return createSuccessResponse({
      response: aiResponse
    }, 'Successfully processed chat request');

  } catch (error) {
    // TODO: Implement proper error handling for the chat service.
    // Consider different types of errors: API errors, network errors, validation errors, etc.
    // Provide meaningful error messages to help debug issues.
    // Should you retry on certain errors? Should you log specific error details?
    // YOU NEED TO IMPLEMENT THIS HERE
    
    // PLACEHOLDER: Generic error handling - proper error handling needed
    console.error('Chat service error - YOU NEED TO IMPLEMENT PROPER ERROR HANDLING:', error);
    return createErrorResponse(
      { message: `Chat processing failed - YOU NEED TO IMPLEMENT PROPER ERROR HANDLING: ${error instanceof Error ? error.message : 'Unknown error'}` },
      'Failed to process chat request'
    );
  }
}
