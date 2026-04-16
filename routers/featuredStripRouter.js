const express = require("express");
const router = express.Router();
const { getStrip, updateStrip } = require("../controllers/featuredStripController");

router.get("/", getStrip);
router.put("/", updateStrip);

module.exports = router;
