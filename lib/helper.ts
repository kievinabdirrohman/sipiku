interface RecaptchaResponse {
    success: boolean;
    score: number;
    action: string;
    challenge_ts: string;
    hostname: string;
    error_codes?: string[];
}

/**
 * Check if the given MIME type is a valid type for a job poster.
 * This function considers the following MIME types as valid:
 * - image/jpeg
 * - image/png
 * - image/gif
 * - image/webp
 * - application/pdf
 * @param {string | null | undefined} mimeType The MIME type to check
 * @returns {boolean} True if the MIME type is valid, false otherwise
 */
export const isValidJobPosterMimeType = (mimeType: string | null | undefined): boolean => {
    if (!mimeType) return false;

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

    return validMimeTypes.includes(mimeType.toLowerCase());
}

/**
* Generates a reCAPTCHA token for a specific action.
* @param {string} action - The action to be performed.
* @returns {Promise<string>} A promise that resolves with the reCAPTCHA token.
* @throws {Error} If reCAPTCHA is not available or if token generation fails.
*/
export const generateRecaptchaToken = async (action: string): Promise<string> => {
    try {
        return await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
            { action }
        )
    } catch (error) {
        throw new Error('Failed to generate reCAPTCHA token')
    }
}

/**
 * Verifies a reCAPTCHA token with the Google reCAPTCHA API.
 * @param {string} token - The reCAPTCHA token to verify.
 * @returns {Promise<RecaptchaResponse>} A promise that resolves with the reCAPTCHA verification response.
 */
export const verifyRecaptcha = async (token: string): Promise<RecaptchaResponse> => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY!;

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    
    return data;
};