const express = require("express");
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const { getLabels, upsertLabel } = require("../controllers/sectionLabelController");

// Public: any page can read section label titles
router.get("/", getLabels);

// Admin-only: upsert a label value
router.put("/:key", adminOnly, upsertLabel);

module.exports = router;
