const express = require('express');
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const ctrl = require('../controllers/bannerController');

router.get('/', ctrl.getSectionsForBanner);
router.post('/', adminOnly, ctrl.createSection);
router.put('/:id', adminOnly, ctrl.updateSection);
router.delete('/:id', adminOnly, ctrl.deleteSection);

module.exports = router;
