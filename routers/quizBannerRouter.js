const express = require('express');
const router = express.Router();
const quizBannerController = require('../controllers/quizBannerController');
const { adminOnly } = require('../controllers/userControllers'); // Check if this is the correct path/auth

router.get('/', quizBannerController.getQuizBanner);
router.put('/', adminOnly, quizBannerController.updateQuizBanner);

module.exports = router;
