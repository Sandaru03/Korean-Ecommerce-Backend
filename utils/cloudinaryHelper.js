const cloudinary = require('./cloudinary');

/**
 * Extracts the Cloudinary public_id from a Cloudinary secure_url.
 * Example input:  "https://res.cloudinary.com/demo/image/upload/v1234/products/abc.webp"
 * Example output: "products/abc"
 *
 * Returns null for non-Cloudinary URLs (e.g. local /default-product.jpg).
 */
function extractPublicId(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.includes('res.cloudinary.com')) return null;

    try {
        // Strip query params / version hash and get the path after /upload/
        const withoutQuery = url.split('?')[0];
        const uploadIndex = withoutQuery.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        let pathAfterUpload = withoutQuery.slice(uploadIndex + '/upload/'.length);

        // Remove optional version segment like "v1234567890/"
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');

        // Remove file extension
        const lastDot = pathAfterUpload.lastIndexOf('.');
        if (lastDot !== -1) {
            pathAfterUpload = pathAfterUpload.slice(0, lastDot);
        }

        return pathAfterUpload || null;
    } catch {
        return null;
    }
}

/**
 * Deletes a single asset from Cloudinary.
 * @param {string} url - The Cloudinary secure_url of the asset.
 * @param {'image'|'video'} resourceType - The type of Cloudinary resource.
 */
async function deleteCloudinaryAsset(url, resourceType = 'image') {
    const publicId = extractPublicId(url);
    if (!publicId) return; // Skip local/non-cloudinary URLs silently

    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        if (result.result === 'ok') {
            console.log(`[Cloudinary] Deleted ${resourceType}: ${publicId}`);
        } else {
            console.warn(`[Cloudinary] Could not delete ${resourceType}: ${publicId} — result: ${result.result}`);
        }
    } catch (err) {
        // Log but don't throw — DB deletion should still proceed
        console.error(`[Cloudinary] Error deleting ${resourceType} ${publicId}:`, err.message);
    }
}

/**
 * Deletes multiple image assets from Cloudinary.
 * @param {string[]} urls - Array of Cloudinary secure_urls.
 */
async function deleteCloudinaryImages(urls = []) {
    const validUrls = (Array.isArray(urls) ? urls : []).filter(Boolean);
    await Promise.all(validUrls.map(url => deleteCloudinaryAsset(url, 'image')));
}

module.exports = { deleteCloudinaryAsset, deleteCloudinaryImages, extractPublicId };
