const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
};

ensureDir('uploads/products');
ensureDir('uploads/reels');
ensureDir('uploads/reels/products');
ensureDir('uploads/general');

// Disk Storage for Images
const storageImages = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve('uploads/general'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, uniqueSuffix + ext);
    }
});

// Disk Storage for Videos (reels)
const storageVideos = multer.diskStorage({
    destination: (req, file, cb) => {
        // Route video files to reels/, images to reels/products/
        if (file.fieldname === 'video') {
            cb(null, path.resolve('uploads/reels'));
        } else {
            cb(null, path.resolve('uploads/reels/products'));
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.mp4';
        cb(null, uniqueSuffix + ext);
    }
});

// Memory storage for product images (processed by sharp before saving)
const storageMemory = multer.memoryStorage();

// File Filter (Images Only)
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// File Filter (Videos and Images — for reels with product images)
const videoAndImageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload a video or image file.'), false);
    }
};

// Upload handler for product images (memory → sharp → disk)
const uploadProductImages = multer({
    storage: storageMemory,
    fileFilter: imageFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Upload handler for general images (direct to disk)
const uploadImages = multer({
    storage: storageImages,
    fileFilter: imageFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Upload handler for reels (video + optional product image)
const uploadReelFiles = multer({
    storage: storageVideos,
    fileFilter: videoAndImageFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

module.exports = {
    uploadProductImages,
    uploadImages,
    uploadReelFiles
};
