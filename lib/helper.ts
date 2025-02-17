
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