const express = require("express");
const router = express.Router();
const { adminOnly } = require('../controllers/userControllers');
const categoryController = require("../controllers/categoryController");

router.post("/", adminOnly, categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", adminOnly, categoryController.updateCategory);
router.delete("/:id", adminOnly, categoryController.deleteCategory);

module.exports = router;
