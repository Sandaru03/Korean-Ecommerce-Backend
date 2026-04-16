const FeaturedStrip = require("../models/FeaturedStrip");
const Product = require("../models/product");

// GET /featured-strip — returns the single strip (or creates default)
exports.getStrip = async (req, res) => {
    try {
        let strip = await FeaturedStrip.findOne({ order: [["id", "ASC"]] });

        if (!strip) {
            strip = await FeaturedStrip.create({
                title: "Featured Products",
                products: [],
                active: true,
            });
        }

        // Hydrate product IDs → full product objects
        const productIds = Array.isArray(strip.products) ? strip.products : [];
        let hydratedProducts = [];
        if (productIds.length > 0) {
            const found = await Product.findAll({
                where: { id: productIds },
                attributes: ["id", "name", "price", "labellPrice", "images", "miniDescription"],
            });
            // Preserve order from productIds
            const byId = Object.fromEntries(found.map(p => [p.id, p.toJSON()]));
            hydratedProducts = productIds.map(id => byId[id]).filter(Boolean);
        }

        res.json({
            success: true,
            strip: {
                id: strip.id,
                title: strip.title,
                active: strip.active,
                products: hydratedProducts,
            },
        });
    } catch (error) {
        console.error("Error fetching featured strip:", error);
        res.status(500).json({ success: false, message: "Failed to fetch featured strip" });
    }
};

// PUT /featured-strip — update title, active, and/or products
exports.updateStrip = async (req, res) => {
    try {
        let strip = await FeaturedStrip.findOne({ order: [["id", "ASC"]] });
        if (!strip) {
            strip = await FeaturedStrip.create({ title: "Featured Products", products: [], active: true });
        }

        const { title, active, products } = req.body;
        if (title !== undefined) strip.title = title;
        if (active !== undefined) strip.active = active;
        if (products !== undefined) strip.products = products; // array of IDs
        strip.changed("products", true);
        await strip.save();

        res.json({ success: true, strip: { id: strip.id, title: strip.title, active: strip.active, products: strip.products } });
    } catch (error) {
        console.error("Error updating featured strip:", error);
        res.status(500).json({ success: false, message: "Failed to update featured strip" });
    }
};
