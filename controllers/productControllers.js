const Product = require("../models/product");
const Category = require("../models/category");
const { isAdmin } = require("./userControllers");
const { Op } = require("sequelize");

function normalizeProductData(raw = {}) {
    const data = { ...raw };

    if (data.labellPrice !== undefined) data.labellPrice = Number(data.labellPrice);
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    if (data.superCategory === undefined) data.superCategory = "";
    if (data.subCategory === undefined) data.subCategory = "";
    if (data.miniDescription === undefined) data.miniDescription = "";

    if (typeof data.isAvailable === "string") {
        data.isAvailable = data.isAvailable.toLowerCase() === "true";
    }

    if (typeof data.altNames === "string") {
        data.altNames = data.altNames
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (!Array.isArray(data.altNames)) {
        data.altNames = [];
    }

    if (!Array.isArray(data.images)) {
        if (typeof data.images === "string") {
            const trimmed = data.images.trim();
            if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                try {
                    const parsed = JSON.parse(trimmed);
                    data.images = Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                    data.images = [trimmed];
                }
            } else if (trimmed.includes(",")) {
                // Handle comma-separated list
                data.images = trimmed.split(",").map(s => s.trim()).filter(Boolean);
            } else {
                data.images = trimmed ? [trimmed] : [];
            }
        } else {
            data.images = data.images ? [data.images] : [];
        }
    }

    return data;
}

/* Create Product */
exports.createProduct = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const data = normalizeProductData(req.body);

        const required = ["productId", "name", "description"];
        for (const key of required) {
            if (!data[key]) {
                return res.status(400).json({ message: `Missing field: ${key}` });
            }
        }
        if (Number.isNaN(data.labellPrice) || Number.isNaN(data.price)) {
            return res.status(400).json({ message: "labellPrice and price must be numbers" });
        }
        if (Number.isNaN(data.stock)) data.stock = 0;
        if (typeof data.isAvailable !== "boolean") data.isAvailable = true;

        const product = await Product.create(data);
        return res.json({ message: "Product created successfully", product });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Failed to create product" });
    }
};

/* Get Products (list) */
exports.getProducts = async (req, res) => {
    try {
        const includeUnavailable =
            String(req.query.includeUnavailable || "").toLowerCase() === "true";
        const { category, subCategory, superCategory, limit } = req.query;

        const where = {};
        if (!isAdmin(req) && !includeUnavailable) {
            where.isAvailable = true;
        }
        
        if (subCategory) {
            where.subCategory = subCategory;
        } else if (category) {
            where.category = category;
        } else if (superCategory) {
            // Find all categories that are children of this supercategory
            const children = await Category.findAll({
                where: { parentName: superCategory },
                attributes: ["name"]
            });
            const names = children.map(c => c.name);
            if (names.length > 0) {
                where.category = { [Op.in]: names };
            } else {
                // Return empty if no categories found
                return res.json([]);
            }
        }

        const options = { where };
        
        // Add limit if provided (useful for "randomized" feel if combined with shuffle on front)
        if (limit) options.limit = parseInt(limit);

        const products = await Product.findAll(options);
        return res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Failed to fetch products" });
    }
};

/* Get Single Product */
exports.getProductInfo = async (req, res) => {
    try {
        const param = req.params.productId;
        const whereClause = isNaN(param) ? { productId: param } : { id: parseInt(param, 10) };
        
        const product = await Product.findOne({ where: whereClause });
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ message: "Failed to fetch product" });
    }
};

/* Update Product */
exports.updateProduct = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Access denied. Admins only" });
        }

        const productId = req.params.productId;

        // Only update fields that were explicitly sent in the request body
        // This prevents overwriting existing product data (images, altNames, etc.)
        const rawBody = req.body;
        const updateData = {};

        // Copy only fields that are present in the body
        const allowedFields = [
            "name", "altNames", "description", "miniDescription", "price",
            "labellPrice", "stock", "isAvailable", "images", "category",
            "subCategory", "superCategory", "productId"
        ];

        for (const field of allowedFields) {
            if (rawBody[field] !== undefined) {
                updateData[field] = rawBody[field];
            }
        }

        // Normalize only the fields that are being updated
        if (updateData.labellPrice !== undefined) updateData.labellPrice = Number(updateData.labellPrice);
        if (updateData.price !== undefined) updateData.price = Number(updateData.price);
        if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
        if (typeof updateData.isAvailable === "string") {
            updateData.isAvailable = updateData.isAvailable.toLowerCase() === "true";
        }
        if (typeof updateData.altNames === "string") {
            updateData.altNames = updateData.altNames.split(",").map(s => s.trim()).filter(Boolean);
        }
        if (updateData.images !== undefined && !Array.isArray(updateData.images)) {
            if (typeof updateData.images === "string") {
                const trimmed = updateData.images.trim();
                if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        updateData.images = Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                        updateData.images = [trimmed];
                    }
                } else if (trimmed.includes(",")) {
                    updateData.images = trimmed.split(",").map(s => s.trim()).filter(Boolean);
                } else {
                    updateData.images = trimmed ? [trimmed] : [];
                }
            } else {
                updateData.images = updateData.images ? [updateData.images] : [];
            }
        }

        const [count] = await Product.update(updateData, { where: { productId } });
        if (count === 0) return res.status(404).json({ message: "Product not found" });

        return res.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Failed to update product" });
    }
};

/* Delete Product */
exports.deleteProduct = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const count = await Product.destroy({ where: { productId: req.params.productId } });
        if (count === 0) return res.status(404).json({ message: "Product not found" });

        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
};

/* Search Products */
exports.searchProducts = async (req, res) => {
    try {
        // Support both ?q= (from admin page) and /:query (legacy)
        const queryStr = req.query.q || req.params.query || "";
        const includeUnavailable =
            String(req.query.includeUnavailable || "").toLowerCase() === "true";

        if (!queryStr.trim()) {
            return res.json({ success: true, products: [] });
        }

        const where = {
            name: { [Op.like]: `%${queryStr}%` },
        };

        if (!isAdmin(req) && !includeUnavailable) {
            where.isAvailable = true;
        }

        const products = await Product.findAll({ where });
        return res.json({ success: true, products });
    } catch (error) {
        console.error("Error searching products:", error);
        return res.status(500).json({ success: false, message: "Failed to search products" });
    }
};
