const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const { uploadLocal, uploadCloudinary } = require('../middleware/upload');
const sharp = require('sharp');

// Cloudinary Upload Route (Dynamic Product Images)
// Cloudinary Upload Route (Dynamic Product Images)
router.post('/cloudinary', uploadCloudinary.array('images', 10), async (req, res) => {
    console.log('Cloudinary upload request received');
    console.log('Files received:', req.files?.length || 0);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images provided' });
    }

    try {
        const uploadPromises = req.files.map(file => {
            return new Promise(async (resolve, reject) => {
                try {
                    // Compress and resize the image using sharp to prevent upload limits
                    const compressedBuffer = await sharp(file.buffer)
                        .resize({ width: 1920, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toBuffer();

                    // Convert compressed buffer to base64 data URI
                    const b64 = compressedBuffer.toString('base64');
                    const dataUri = `data:image/webp;base64,${b64}`;

                    cloudinary.uploader.upload(dataUri, { folder: 'products' })
                        .then(result => {
                            console.log('Upload success:', file.originalname, '->', result.secure_url);
                            resolve(result.secure_url);
                        })
                        .catch(error => {
                            console.error('Upload failed for', file.originalname, ':', error.message);
                            reject(error);
                        });
                } catch (sharpError) {
                    console.error('Sharp processing error for', file.originalname, ':', sharpError.message);
                    reject(sharpError);
                }
            });
        });

        const urls = await Promise.all(uploadPromises);
        res.json({ message: 'Images uploaded successfully to Cloudinary', urls });
    } catch (error) {
        console.error('Cloudinary upload error:', error.message);
        res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
    }
});

module.exports = router;
