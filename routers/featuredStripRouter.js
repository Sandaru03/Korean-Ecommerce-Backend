const express = require("express");
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const { getStrip, updateStrip } = require("../controllers/featuredStripController");

router.get("/", getStrip);
router.put("/", adminOnly, updateStrip);

module.exports = router;
