const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage for Local Uploads (Disk Storage)
const storageLocal = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage for Cloudinary Uploads (Memory Storage)
const storageCloudinary = multer.memoryStorage();

// File Filter (Images Only)
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// File Filter (Videos Only)
const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Not a video! Please upload a video file.'), false);
    }
};

const uploadLocal = multer({
    storage: storageLocal,
    fileFilter: imageFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const uploadCloudinary = multer({
    storage: storageCloudinary,
    fileFilter: imageFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const uploadVideoCloudinary = multer({
    storage: storageCloudinary,
    fileFilter: videoFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

module.exports = {
    uploadLocal,
    uploadCloudinary,
    uploadVideoCloudinary
};
