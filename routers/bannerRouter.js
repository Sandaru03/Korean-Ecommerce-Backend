const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bannerController');

router.get('/', ctrl.getSectionsForBanner);
router.post('/', ctrl.createSection);
router.put('/:id', ctrl.updateSection);
router.delete('/:id', ctrl.deleteSection);

module.exports = router;
