const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const { uploadLocal, uploadCloudinary } = require('../middleware/upload');

// Cloudinary Upload Route (Dynamic Product Images)
router.post('/cloudinary', uploadCloudinary.array('images', 10), async (req, res) => {
    try {
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'products' }, // Optional: organize in a folder
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                uploadStream.end(file.buffer);
            });
        });

        const urls = await Promise.all(uploadPromises);
        res.json({ message: 'Images uploaded locally to Cloudinary', urls: urls });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
    }
});

// Local Upload Route (Static Banner/Category Images)
router.post('/local', uploadLocal.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Construct local URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ message: 'Image uploaded locally', url: fileUrl });
});

module.exports = router;
