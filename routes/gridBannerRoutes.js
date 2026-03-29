const express = require("express");
const router = express.Router();
const gridBannerController = require("../controllers/gridBannerController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET all grid banners
router.get("/", gridBannerController.getBanners);

// PUT update a specific grid banner slot
router.put("/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, gridBannerController.updateBanner);

module.exports = router;
