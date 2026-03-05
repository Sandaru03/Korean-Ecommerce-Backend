const Category = require("../models/category");

// Create a new Category
exports.createCategory = async (req, res) => {
    try {
        const { name, image, subcategories } = req.body;

        // Check if category exists
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({ message: "Category with this name already exists" });
        }

        const newCategory = await Category.create({
            name,
            image,
            subcategories: subcategories || []
        });

        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create category", error: error.message });
    }
};

// Get all Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json({ categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
};

// Get a single Category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ category });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "Failed to fetch category", error: error.message });
    }
};

// Update a Category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, subcategories } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if updating name to an already existing one
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ where: { name } });
            if (existingCategory) {
                return res.status(400).json({ message: "Category with this name already exists" });
            }
        }

        await category.update({
            name: name !== undefined ? name : category.name,
            image: image !== undefined ? image : category.image,
            subcategories: subcategories !== undefined ? subcategories : category.subcategories,
        });

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Failed to update category", error: error.message });
    }
};

// Delete a Category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await category.destroy();
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
};
