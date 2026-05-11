const express = require('express');
const router = express.Router();
const { 
    getAllGalleryReviews, 
    adminGetAllGalleryReviews, 
    addGalleryReview, 
    updateGalleryReview, 
    deleteGalleryReview 
} = require('../controllers/galleryReviewController');

const ensureAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }
    next();
};

// Public route
router.get('/', getAllGalleryReviews);

// Admin routes
router.get('/admin', ensureAdmin, adminGetAllGalleryReviews);
router.post('/', ensureAdmin, addGalleryReview);
router.put('/:id', ensureAdmin, updateGalleryReview);
router.delete('/:id', ensureAdmin, deleteGalleryReview);

module.exports = router;
