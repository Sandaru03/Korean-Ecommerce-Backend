const express = require('express');
const router = express.Router();
const adBannerController = require('../controllers/adBannerController');

// Define routes
router.get('/', adBannerController.getAllAdBanners); // All banners for admin
router.get('/active', adBannerController.getActiveAdBanners); // Active banners for homepage
router.post('/', adBannerController.createAdBanner);
router.put('/:id', adBannerController.updateAdBanner);
router.delete('/:id', adBannerController.deleteAdBanner);

module.exports = router;
