const express = require('express');
const router = express.Router();
const homePageTopicController = require('../controllers/homePageTopicController');

router.get('/', homePageTopicController.getAllTopics);
router.post('/', homePageTopicController.createTopic);
router.put('/:id', homePageTopicController.updateTopic);
router.delete('/:id', homePageTopicController.deleteTopic);

module.exports = router;
