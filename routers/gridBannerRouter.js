const express = require("express");
const router = express.Router();
const gridBannerController = require("../controllers/gridBannerController");

// GET all grid banners
router.get("/", gridBannerController.getBanners);

// PUT update a specific grid banner slot
router.put("/:id", gridBannerController.updateBanner);

module.exports = router;
