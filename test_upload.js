require('dotenv').config();
const cloudinary = require('./utils/cloudinary');

// Create a minimal 1x1 pixel PNG buffer
const pngBuf = Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10,
  0, 0, 0, 13, 73, 72, 68, 82,
  0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222,
  0, 0, 0, 12, 73, 68, 65, 84, 8, 215, 99, 248, 15, 0, 0, 1, 1, 0, 5, 24, 213, 78,
  0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
]);

console.log('Testing Cloudinary upload_stream...');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API key set:', !!process.env.CLOUDINARY_API_KEY);
console.log('API secret set:', !!process.env.CLOUDINARY_API_SECRET);

const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'test' },
    (error, result) => {
        if (error) {
            console.error('UPLOAD STREAM FAILED:');
            console.error('  message:', error.message);
            console.error('  http_code:', error.http_code);
            console.error('  name:', error.name);
            console.error('  full error:', JSON.stringify(error, null, 2));
        } else {
            console.log('UPLOAD STREAM SUCCESS:', result.secure_url);
        }
    }
);

uploadStream.end(pngBuf);
