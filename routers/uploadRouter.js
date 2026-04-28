const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { uploadProductImages } = require('../middleware/upload');

// Ensure products upload directory exists
const productsDir = path.resolve('uploads/products');
if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
}

// Local Upload Route (Product Images — compressed via Sharp)
router.post('/local', uploadProductImages.array('images', 10), async (req, res) => {
    console.log('Local upload request received');
    console.log('Files received:', req.files?.length || 0);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images provided' });
    }

    try {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

        const urls = await Promise.all(req.files.map(async (file) => {
            try {
                // Compress and resize the image using sharp
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const outputFilename = `${uniqueSuffix}.webp`;
                const outputPath = path.join(productsDir, outputFilename);

                await sharp(file.buffer)
                    .resize({ width: 1920, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                const publicUrl = `${baseUrl}/uploads/products/${outputFilename}`;
                console.log('Upload success:', file.originalname, '->', publicUrl);
                return publicUrl;
            } catch (sharpError) {
                console.error('Sharp processing error for', file.originalname, ':', sharpError.message);
                throw sharpError;
            }
        }));

        res.json({ message: 'Images uploaded successfully', urls });
    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

module.exports = router;
