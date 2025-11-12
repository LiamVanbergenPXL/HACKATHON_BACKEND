# TODO List - Hackathon Implementation Tasks

This file contains all the TODO items that need to be implemented by students during the hackathon. Each TODO includes the file location and a brief description of what needs to be implemented.

## Table of Contents

- [Chat Service](#chat-service)
- [Fish Service](#fish-service)
- [Image Processing](#image-processing)
- [Fish Detection](#fish-detection)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Routes](#routes)

---

## Chat Service

### `src/services/chat.service.ts`

#### 1. User Message Validation
**Location:** Line ~7-15  
**Description:** Validate the user message before processing. Check if the message is not empty, not too long, and contains valid content. Return appropriate error messages for invalid input.

**Current State:** Basic empty check only - returns error message indicating incomplete implementation.

---

#### 2. Fish Data Formatting
**Location:** Line ~28-33  
**Description:** Format fish data for the AI in a structured way that the AI can understand. Extract relevant information from each fish entry and format it appropriately. Consider what fields are most important for answering questions about the fish (family, size, water type, description, habitat, conservation status, etc.).

**Current State:** Returns only fish name and placeholder "basicInfo" field.

---

#### 3. System Message Construction
**Location:** Line ~47-56  
**Description:** Create a system message that provides context to the AI about the detected fish. The system message should include all relevant fish data in a format the AI can understand. Consider how to structure the information clearly and what instructions to give the AI (e.g., only answer questions about fish detections).

**Current State:** Basic message with JSON-stringified fish data - needs proper formatting.

---

#### 4. AI Response Extraction & Validation
**Location:** Line ~79-89  
**Description:** Extract and validate the AI response properly. Handle cases where the response might be null, empty, or malformed. Consider what should happen if the AI doesn't return a valid response.

**Current State:** Basic extraction with null check - needs proper validation.

---

#### 5. Error Handling
**Location:** Line ~96-108  
**Description:** Implement proper error handling for the chat service. Consider different types of errors: API errors, network errors, validation errors, etc. Provide meaningful error messages to help debug issues. Should you retry on certain errors? Should you log specific error details?

**Current State:** Generic error handling with placeholder message.

---

## Fish Service

### `src/services/fish.service.ts`

#### 6. Related Data Creation (Colors, Predators, FunFacts)
**Location:** Line ~11-15  
**Description:** Implement creation of related fish data (colors, predators, fun facts) when a new fish is registered. These should be stored as separate documents linked to the fish. Check the fishData object for colors, predators, funFacts, and images arrays and create corresponding records using the FishColor, Predator, FunFact, and FishImage models.

**Current State:** Fish is created without related data (colors, predators, fun facts).

---

#### 7. Fish Data Validation
**Location:** Line ~43-50  
**Description:** Validate incoming fish data to ensure all required fields are present and have valid values. Consider what fields are essential for a fish record (name, family, size, waterType, etc.). Return appropriate error messages for missing or invalid fields.

**Current State:** Only checks for name existence - needs full validation.

---

#### 8. Image URL Construction
**Location:** Line ~82-87  
**Description:** Construct proper image URLs for each fish entry. Images are stored locally and should be accessible via the API image endpoint. Each fish entry has an imageUrl field that needs to be converted to a full API endpoint URL (e.g., `/api/fish/image/{path}`).

**Current State:** Returns placeholder "YOU NEED TO IMPLEMENT THIS HERE" instead of proper URLs.

---

#### 9. Rate Limiting Logic
**Location:** Line ~137-166  
**Description:** Implement rate limiting to prevent the same fish from being added multiple times within a short time period. Consider what time window makes sense (e.g., 10 seconds) and how to track recent additions. Check if this fish was recently added to this device and skip if it was added too recently.

**Current State:** Always adds fish - no rate limiting implemented.

---

## Image Processing

### `src/lib/simpleImageProcessor.ts`

#### 10. Image Optimization/Resizing
**Location:** Line ~70-74  
**Description:** Optimize images before saving to reduce storage space. Consider resizing large images and compressing them while maintaining quality. You may want to use the 'sharp' library that's already in dependencies.

**Current State:** Images saved as-is without optimization.

---

#### 11. JSON Response Cleaning
**Location:** Line ~85-89  
**Description:** Clean AI responses that may be wrapped in markdown code blocks. The AI sometimes returns JSON wrapped in ```json blocks that need to be removed before parsing. Handle cases where responses start with ```json, ```, or other markdown formatting.

**Current State:** Returns response as-is - may fail if wrapped in markdown.

---

#### 12. Related Data Extraction from AI Response
**Location:** Line ~222-231  
**Description:** Extract fish data from the AI response structure. The AI may return data in different formats - ensure you handle the response structure correctly. The response might have fishData nested, or it might be flat. Handle both cases and validate that the extracted data is a valid object.

**Current State:** Assumes flat structure - may fail if nested.

---

#### 13. Error Handling in Image Processing Pipeline
**Location:** Line ~275-274  
**Description:** Implement proper error handling for the image processing pipeline. Consider what should happen if OpenAI API calls fail, if image saving fails, or if API calls to register fish fail. Should you retry? Should you log specific errors? Should you notify the user?

**Current State:** Basic try-catch with generic error message.

---

## Fish Detection

### `src/lib/fishDetection.ts`

#### 14. Image Detection Confidence Filtering
**Location:** Line ~74-85  
**Description:** Filter fish detections based on confidence scores. Only process detections above a certain confidence threshold to avoid false positives. Consider what confidence threshold makes sense (e.g., 0.5, 0.65, 0.8).

**Current State:** Accepts all detections - no confidence filtering.

---

#### 15. Synchronous vs Asynchronous Processing (Optional)
**Location:** Line ~88  
**Description:** You can make image processing synchronous by awaiting if you want immediate feedback. Currently processes asynchronously (fire and forget).

**Current State:** Asynchronous processing - can be made synchronous if needed.

---

## Validation

### `src/validation/device.validation.ts`

#### 16. Device ID Validation
**Location:** Line ~14-40  
**Description:** Validate device IDs to ensure they meet certain criteria (e.g., non-empty string, proper format, length restrictions). Return appropriate error messages for invalid IDs. Consider using Zod validation (already imported) or custom validation logic.

**Current State:** Basic empty check only - returns error message indicating incomplete implementation.

---

## Error Handling

### `src/lib/mongooseResponseFormatter.ts`

#### 17. Mongoose Error Formatting
**Location:** Line ~16-26  
**Description:** Format different types of Mongoose errors into a consistent API response format. Handle validation errors (MongooseError.ValidationError), cast errors (MongooseError.CastError), and duplicate key errors (code 11000) appropriately. Extract field names, error messages, and error codes.

**Current State:** Returns generic error message - needs specific error type handling.

---

## Routes

### `src/routes/fish.route.ts`

#### 18. Image Path Encoding/Decoding
**Location:** Line ~91-104  
**Description:** Handle URL encoding and decoding for image paths. Image paths may contain special characters that need to be properly encoded when used in URLs. Use encodeURIComponent when constructing URLs and decodeURIComponent when reading from URLs.

**Current State:** Uses path directly without encoding/decoding - may break with special characters.

---

## Legacy/Compatibility

### `src/lib/handleImageCutMessageQueue.ts`

#### 19. Legacy File (No Implementation Needed)
**Location:** Line ~2  
**Description:** This file is kept for backwards compatibility but is no longer used. The actual processing happens in simpleImageProcessor.ts which is called from fishDetection.ts.

**Current State:** Deprecated - no action needed.

---

## Summary

**Total TODOs:** 18 implementation tasks + 1 legacy note

### By Priority (Suggested Implementation Order)

**High Priority (Core Functionality):**
1. Fish Data Formatting (Chat Service)
2. System Message Construction (Chat Service)
3. Image URL Construction (Fish Service)
4. JSON Response Cleaning (Image Processing)
5. Related Data Extraction (Image Processing)

**Medium Priority (Data Quality):**
6. Rate Limiting Logic (Fish Service)
7. Fish Data Validation (Fish Service)
8. Device ID Validation (Validation)
9. User Message Validation (Chat Service)
10. Image Detection Confidence Filtering (Fish Detection)

**Lower Priority (Optimization & Error Handling):**
11. Image Optimization/Resizing (Image Processing)
12. Mongoose Error Formatting (Error Handling)
13. AI Response Extraction & Validation (Chat Service)
14. Error Handling (Chat Service)
15. Error Handling in Image Processing (Image Processing)
16. Image Path Encoding/Decoding (Routes)

**Optional:**
17. Related Data Creation (Fish Service) - Nice to have
18. Synchronous vs Asynchronous Processing (Fish Detection) - Optional enhancement

---

## Notes for Students

- All endpoints must return valid JSON responses (even if placeholder)
- Keep function signatures intact
- Maintain basic error handling (don't crash the server)
- Test each implementation as you complete it
- Some TODOs are interdependent (e.g., Fish Data Formatting affects System Message Construction)
- Use the existing code structure and patterns as a guide
- Check the database models to understand the data structure
- Refer to the BACKEND_ARCHITECTURE.md for system overview

Good luck! 🐠

