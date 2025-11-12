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
    const MAX_MESSAGE_LENGTH = 2048;
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
      const fish = fishEntry.fish as any;
      // TODO: Select and format the most relevant fish properties for the AI context
      return {
        name: fish.name || "Unknown",
        // YOU NEED TO IMPLEMENT PROPER FISH DATA FORMATTING HERE
        // Consider including: family, size, water type, description, habitat, conservation status, etc.
        basicInfo: "YOU NEED TO IMPLEMENT PROPER FISH DATA FORMATTING"
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
    const systemMessage = `You are a helpful assistant. 
    Fish data: ${JSON.stringify(fishData)}
    YOU NEED TO IMPLEMENT PROPER SYSTEM MESSAGE CONSTRUCTION HERE.
    The system message should provide context about detected fish and instruct the AI on how to respond.`;

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
