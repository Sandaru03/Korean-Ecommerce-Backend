const express = require("express");
const router = express.Router();
const { getLabels, upsertLabel } = require("../controllers/sectionLabelController");

// Public: any page can read section label titles
router.get("/", getLabels);

// Admin-only: upsert a label value
router.put("/:key", upsertLabel);

module.exports = router;
