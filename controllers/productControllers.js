const Product = require("../models/product");
const { isAdmin } = require("./userControllers");

function normalizeProductData(raw = {}) {
    const data = { ...raw };

    // Coerce numeric fields
    if (data.labellPrice !== undefined) data.labellPrice = Number(data.labellPrice);
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);

    // (isAvailable can arrive as "true"/"false")
    if (typeof data.isAvailable === "string") {
        data.isAvailable = data.isAvailable.toLowerCase() === "true";
    }

    // altNames can be string like "x,y,z"
    if (typeof data.altNames === "string") {
        data.altNames = data.altNames
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (!Array.isArray(data.altNames)) {
        data.altNames = [];
    }

    // images default safety
    if (!Array.isArray(data.images)) {
        data.images = [];
    }

    return data;
}

/* Create Product  */
exports.createProduct = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const data = normalizeProductData(req.body);

        // Minimal presence checks
        const required = ["productId", "name", "description", "category"];
        for (const key of required) {
            if (!data[key]) {
                return res.status(400).json({ message: `Missing field: ${key}` });
            }
        }
        if (Number.isNaN(data.labellPrice) || Number.isNaN(data.price)) {
            return res.status(400).json({ message: "labellPrice and price must be numbers" });
        }
        if (Number.isNaN(data.stock)) {
            data.stock = 0;
        }
        if (typeof data.isAvailable !== "boolean") {
            data.isAvailable = true;
        }

        const product = new Product(data);
        const saved = await product.save();

        return res.json({
            message: "Product created successfully",
            product: saved,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Failed to create product" });
    }
};

/*  Get Products (list) */
exports.getProducts = async (req, res) => {
    try {
        const includeUnavailable =
            String(req.query.includeUnavailable || "").toLowerCase() === "true";

        let query = {};
        if (!isAdmin(req) && !includeUnavailable) {
            query.isAvailable = true;
        }

        const products = await Product.find(query).lean();
        return res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Failed to fetch products" });
    }
};

/*  Get Single Product (Overview uses this)*/
exports.getProductInfo = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findOne({ productId }).lean();

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ message: "Failed to fetch product" });
    }
};

/* Update Product  */
exports.updateProduct = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({
                message: "Access denied. Admins only",
            });
        }

        const productId = req.params.productId;
        const data = normalizeProductData({ ...req.body, productId });

        const result = await Product.updateOne({ productId }, data);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Failed to update product" });
    }
};

/*  Delete Product */
exports.deleteProduct = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({
                message: "Access denied. Admin only.",
            });
        }

        const productId = req.params.productId;
        const result = await Product.deleteOne({ productId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
};

/* Search Products  */
exports.searchProducts = async (req, res) => {
    try {
        const queryStr = req.params.query || "";
        const includeUnavailable =
            String(req.query.includeUnavailable || "").toLowerCase() === "true";

        const mongoQuery = {
            $or: [
                { name: { $regex: queryStr, $options: "i" } },
                { altNames: { $elemMatch: { $regex: queryStr, $options: "i" } } },
            ],
        };

        if (!isAdmin(req) && !includeUnavailable) {
            mongoQuery.isAvailable = true;
        }

        const products = await Product.find(mongoQuery).lean();
        return res.json(products);
    } catch (error) {
        console.error("Error searching products:", error);
        return res.status(500).json({ message: "Failed to search products" });
    }
};
