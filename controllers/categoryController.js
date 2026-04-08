const Category = require("../models/category");

// Helper to build a tree from a flat list
const buildTree = (cats, parentId = null) => {
    return cats
        .filter(c => c.parentId === parentId)
        .map(c => ({
            ...c.toJSON(),
            children: buildTree(cats, c.id)
        }));
};

// Create a new Category
exports.createCategory = async (req, res) => {
    try {
        const { name, slug, image, parentId } = req.body;

        // Check if category exists
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({ message: "Category with this name already exists" });
        }

        const newCategory = await Category.create({
            name,
            slug: slug || name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
            image,
            parentId: parentId || null,
            showInNavbar: true // Default to true for new categories
        });

        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create category", error: error.message });
    }
};

// Get all Categories (returns flat list by default, or tree if requested)
exports.getAllCategories = async (req, res) => {
    try {
        const { tree } = req.query;
        const categories = await Category.findAll();
        
        if (tree === 'true') {
            const nested = buildTree(categories);
            return res.status(200).json({ categories: nested });
        }

        res.status(200).json({ categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
};

// Get category by slug (includes its children AND grandchildren — 2 levels deep)
exports.getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({ 
            where: { slug: req.params.slug },
            include: [
                {
                    model: Category,
                    as: 'children',
                    include: [{ model: Category, as: 'children' }]
                },
                {
                    model: Category,
                    as: 'parent',
                    include: [{ model: Category, as: 'parent' }]
                }
            ]
        });
        
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        
        res.status(200).json({ category });
    } catch (error) {
        console.error("Error fetching category by slug:", error);
        res.status(500).json({ message: "Failed to fetch category", error: error.message });
    }
};

// Get a single Category by ID (includes children AND grandchildren)
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [
                {
                    model: Category,
                    as: 'children',
                    include: [{ model: Category, as: 'children' }]
                },
                {
                    model: Category,
                    as: 'parent',
                    include: [{ model: Category, as: 'parent' }]
                }
            ]
        });
        
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
        const { name, slug, image, parentId } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Prevent setting itself as parent
        if (parentId && parseInt(parentId) === parseInt(id)) {
            return res.status(400).json({ message: "A category cannot be its own parent" });
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
            slug: slug !== undefined ? slug : category.slug,
            image: image !== undefined ? image : category.image,
            parentId: parentId !== undefined ? (parentId || null) : category.parentId,
            showInNavbar: req.body.showInNavbar !== undefined ? req.body.showInNavbar : category.showInNavbar,
        });

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Failed to update category", error: error.message });
    }
};

// Delete a Category (recursively deletes grandchildren → children → self)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id, {
            include: [{
                model: Category,
                as: 'children',
                include: [{ model: Category, as: 'children' }]
            }]
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Collect all descendant IDs (children + grandchildren)
        const childIds = (category.children || []).map(c => c.id);
        const grandchildIds = (category.children || []).flatMap(c => (c.children || []).map(g => g.id));

        // Delete deepest level first
        if (grandchildIds.length > 0) {
            await Category.destroy({ where: { id: grandchildIds } });
        }
        if (childIds.length > 0) {
            await Category.destroy({ where: { id: childIds } });
        }
        await category.destroy();

        res.status(200).json({ message: "Category and all descendants deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
};
