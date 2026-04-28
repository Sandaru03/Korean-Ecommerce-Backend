const express = require('express');
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const adBannerController = require('../controllers/adBannerController');

// Define routes
router.get('/', adBannerController.getAllAdBanners); // All banners for admin
router.get('/active', adBannerController.getActiveAdBanners); // Active banners for homepage
router.post('/', adminOnly, adBannerController.createAdBanner);
router.put('/:id', adminOnly, adBannerController.updateAdBanner);
router.delete('/:id', adminOnly, adBannerController.deleteAdBanner);

module.exports = router;
