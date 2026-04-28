const fs = require('fs');
const path = require('path');

/**
 * Extracts the local file path from a full URL.
 * Example input:  "https://api.example.com/uploads/products/1714100000-img.webp"
 * Example output: "uploads/products/1714100000-img.webp"
 *
 * Also handles relative paths like "/uploads/products/img.webp"
 * Returns null for external URLs (e.g. Cloudinary URLs still in DB from old data).
 */
function extractLocalPath(url) {
    if (!url || typeof url !== 'string') return null;

    // Skip any legacy Cloudinary URLs still in the database
    if (url.includes('res.cloudinary.com')) return null;

    // Handle full URLs: extract path after /uploads/
    const uploadsIndex = url.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
        return url.slice(uploadsIndex + 1); // returns "uploads/..."
    }

    // Handle relative paths starting with "uploads/"
    if (url.startsWith('uploads/')) {
        return url;
    }

    return null;
}

/**
 * Deletes a single file from local storage.
 * @param {string} url - The URL or path of the file to delete.
 * @param {'image'|'video'} resourceType - For logging purposes only.
 */
async function deleteLocalFile(url, resourceType = 'image') {
    const localPath = extractLocalPath(url);
    if (!localPath) return; // Skip external/non-local URLs silently

    const absolutePath = path.resolve(localPath);

    try {
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`[LocalStorage] Deleted ${resourceType}: ${localPath}`);
        } else {
            console.warn(`[LocalStorage] File not found, skipping: ${localPath}`);
        }
    } catch (err) {
        // Log but don't throw — DB deletion should still proceed
        console.error(`[LocalStorage] Error deleting ${resourceType} ${localPath}:`, err.message);
    }
}

/**
 * Deletes multiple files from local storage.
 * @param {string[]} urls - Array of file URLs/paths.
 */
async function deleteLocalFiles(urls = []) {
    const validUrls = (Array.isArray(urls) ? urls : []).filter(Boolean);
    await Promise.all(validUrls.map(url => deleteLocalFile(url, 'image')));
}

module.exports = { deleteLocalFile, deleteLocalFiles, extractLocalPath };
