const express = require('express');
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const middleBannerController = require('../controllers/middleBannerController');

router.get('/', middleBannerController.getMiddleBanners);
router.post('/', adminOnly, middleBannerController.createMiddleBanner);
router.put('/:id', adminOnly, middleBannerController.updateMiddleBanner);
router.delete('/:id', adminOnly, middleBannerController.deleteMiddleBanner);

module.exports = router;
