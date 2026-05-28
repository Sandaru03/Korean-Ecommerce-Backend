const Category = require("../models/category");
const { deleteLocalFile } = require('../utils/localFileHelper');

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

        // Check if category exists under the same parent
        const existingCategory = await Category.findOne({ 
            where: { 
                name, 
                parentId: parentId || null 
            } 
        });
        if (existingCategory) {
            return res.status(400).json({ message: "A category with this name already exists under the selected parent." });
        }

        // Generate a smart slug based on name and parent
        let finalSlug = slug || name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        if (!slug && parentId) {
            const parentCat = await Category.findByPk(parentId);
            if (parentCat) {
                finalSlug = `${parentCat.slug}-${finalSlug}`;
            }
        }
        
        // Ensure slug is completely unique (for URL routing)
        let slugExists = await Category.findOne({ where: { slug: finalSlug } });
        let slugCounter = 1;
        let baseSlug = finalSlug;
        while (slugExists) {
            finalSlug = `${baseSlug}-${slugCounter}`;
            slugExists = await Category.findOne({ where: { slug: finalSlug } });
            slugCounter++;
        }

        const newCategory = await Category.create({
            name,
            slug: finalSlug,
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

        const targetParentId = parentId !== undefined ? (parentId || null) : category.parentId;
        const targetName = name !== undefined ? name : category.name;

        // Check if updating name to an already existing one under the SAME parent
        if (name !== undefined || parentId !== undefined) {
            const existingCategory = await Category.findOne({ 
                where: { 
                    name: targetName, 
                    parentId: targetParentId 
                } 
            });
            if (existingCategory && existingCategory.id !== parseInt(id)) {
                return res.status(400).json({ message: "A category with this name already exists under the selected parent." });
            }
        }

        // Handle slug updates
        let finalSlug = slug !== undefined ? slug : category.slug;
        if (slug !== undefined && slug !== category.slug) {
             let slugExists = await Category.findOne({ where: { slug: finalSlug } });
             let slugCounter = 1;
             let baseSlug = finalSlug;
             while (slugExists && slugExists.id !== parseInt(id)) {
                 finalSlug = `${baseSlug}-${slugCounter}`;
                 slugExists = await Category.findOne({ where: { slug: finalSlug } });
                 slugCounter++;
             }
        }

        // Delete old image if a new one is provided or it is cleared
        if (image !== undefined && image !== category.image && category.image) {
            await deleteLocalFile(category.image, 'image');
        }

        await category.update({
            name: targetName,
            slug: finalSlug,
            image: image !== undefined ? image : category.image,
            parentId: targetParentId,
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

        // Collect all images from self + descendants before deleting any records
        const imagesToDelete = [
            category.image,
            ...(category.children || []).map(c => c.image),
            ...(category.children || []).flatMap(c => (c.children || []).map(g => g.image)),
        ].filter(Boolean);

        // Delete all category images from local storage
        await Promise.all(imagesToDelete.map(url => deleteLocalFile(url, 'image')));

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
