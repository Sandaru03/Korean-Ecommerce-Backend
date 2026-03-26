const express = require('express');
const router = express.Router();
const middleBannerController = require('../controllers/middleBannerController');

router.get('/', middleBannerController.getMiddleBanners);
router.post('/', middleBannerController.createMiddleBanner);
router.put('/:id', middleBannerController.updateMiddleBanner);
router.delete('/:id', middleBannerController.deleteMiddleBanner);

module.exports = router;
