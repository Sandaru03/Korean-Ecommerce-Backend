const express = require('express');
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const homePageTopicController = require('../controllers/homePageTopicController');

router.get('/', homePageTopicController.getAllTopics);
router.post('/', adminOnly, homePageTopicController.createTopic);
router.put('/:id', adminOnly, homePageTopicController.updateTopic);
router.delete('/:id', adminOnly, homePageTopicController.deleteTopic);

module.exports = router;
