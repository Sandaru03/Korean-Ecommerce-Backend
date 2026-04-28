const express = require('express');
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const ctrl = require('../controllers/bannerPageController');

router.get('/', ctrl.getAllBanners);
router.get('/:id', ctrl.getBannerById);
router.post('/', adminOnly, ctrl.createBanner);
router.put('/:id', adminOnly, ctrl.updateBanner);
router.delete('/:id', adminOnly, ctrl.deleteBanner);

module.exports = router;
