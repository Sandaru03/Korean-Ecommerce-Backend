const express = require('express');
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const reelsController = require('../controllers/reelsController');
const { uploadReelFiles } = require('../middleware/upload');

// Admin Auth middleware could be added here if needed, 
// but assuming global auth or route-specific auth applies.

// Public route for homepage
router.get('/active', reelsController.getActiveReels);

// Admin routes
router.get('/', reelsController.getAllReels);
router.get('/:id', reelsController.getReelById);
router.post('/', adminOnly, uploadReelFiles.fields([
    { name: 'video', maxCount: 1 },
    { name: 'productImage', maxCount: 1 }
]), reelsController.createReel);
router.put('/:id', adminOnly, reelsController.updateReel);
router.put('/:id/toggle-status', adminOnly, reelsController.toggleReelStatus);
router.delete('/:id', adminOnly, reelsController.deleteReel);

module.exports = router;
