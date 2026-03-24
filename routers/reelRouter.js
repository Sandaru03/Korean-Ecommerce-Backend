const express = require('express');
const router = express.Router();
const reelsController = require('../controllers/reelsController');
const { uploadVideoCloudinary } = require('../middleware/upload');

// Admin Auth middleware could be added here if needed, 
// but assuming global auth or route-specific auth applies.

// Public route for homepage
router.get('/active', reelsController.getActiveReels);

// Admin routes
router.get('/', reelsController.getAllReels);
router.post('/', uploadVideoCloudinary.fields([
    { name: 'video', maxCount: 1 },
    { name: 'productImage', maxCount: 1 }
]), reelsController.createReel);
router.put('/:id/toggle-status', reelsController.toggleReelStatus);
router.delete('/:id', reelsController.deleteReel);

module.exports = router;
