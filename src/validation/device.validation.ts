import { z } from 'zod';
import { FormattedError, formatZodError } from '../lib/zodErrorFormatter';


const deviceIdSchema = z.string()
    .trim()
    .min(3, { message: "Device ID must be at least 3 characters long" })
    .max(256, { message: "Device ID cannot be longer than 256 characters" });

export const validateDeviceId = (id: string): {id: string | null, success: boolean, error: FormattedError | null} => {
    // TODO: Validate device IDs to ensure they meet certain criteria (e.g., non-empty string, proper format).
    // Return appropriate error messages for invalid IDs.
    // YOU NEED TO IMPLEMENT THIS HERE
    
    // PLACEHOLDER: Basic check only - returns error for empty strings
    const validationResult = deviceIdSchema.safeParse(id);
    if (validationResult.success) {
        // Validatie geslaagd
        return {
            error: null,
            id: validationResult.data, // Dit is de getrimde string
            success: true
        };
    } else {
        // Validatie mislukt, formatteer de Zod-fout
        const formattedError = formatZodError(validationResult.error);
        return {
            error: formattedError,
            id: null,
            success: false,
        };
    }
    // Basic placeholder - proper validation needed
}
export const deviceRegisterValidation = z.object({
    id: deviceIdSchema,
});

export const deviceFindValidation = z.object({
    id: deviceIdSchema,
})