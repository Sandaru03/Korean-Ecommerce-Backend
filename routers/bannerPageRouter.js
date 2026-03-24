const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bannerPageController');

router.get('/', ctrl.getAllBanners);
router.get('/:id', ctrl.getBannerById);
router.post('/', ctrl.createBanner);
router.put('/:id', ctrl.updateBanner);
router.delete('/:id', ctrl.deleteBanner);

module.exports = router;
