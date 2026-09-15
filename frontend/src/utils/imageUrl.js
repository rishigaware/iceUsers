/**
 * Returns the correct image URL regardless of storage type.
 * - If the path is already a full URL (Cloudinary / http / https), return it directly.
 * - Otherwise, prepend the backend base URL (legacy local uploads).
 *
 * @param {string} imagePath - The path or URL stored in MongoDB
 * @param {string} baseUrl   - The backend base URL from UserContext
 * @returns {string} A valid, absolute image URL
 */
export const getImageUrl = (imagePath, baseUrl) => {
  if (!imagePath) return '';
  // Already a full URL (Cloudinary or any https/http link)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Legacy local path — prepend backend base URL
  return `${baseUrl}/${imagePath}`;
};
