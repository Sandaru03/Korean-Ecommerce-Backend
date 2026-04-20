const FlashDeal = require("../models/FlashDeal");
const Product = require("../models/product");

// GET /flash-deals — returns the current flash deal config + full product data
exports.getFlashDeal = async (req, res) => {
    try {
        let deal = await FlashDeal.findOne({ order: [["id", "ASC"]] });

        if (!deal) {
            return res.json({
                success: true,
                deal: {
                    id: null,
                    title: "Flash Deals",
                    productIds: [],
                    active: false,
                    products: [],
                },
            });
        }

        const productIds = deal.productIds || [];
        let products = [];

        if (productIds.length > 0) {
            const { Op } = require("sequelize");
            const rawProducts = await Product.findAll({
                where: { id: { [Op.in]: productIds } },
            });
            // Preserve order from productIds
            products = productIds
                .map((id) => rawProducts.find((p) => p.id === id))
                .filter(Boolean);
        }

        return res.json({
            success: true,
            deal: {
                id: deal.id,
                title: deal.title,
                productIds: deal.productIds,
                active: deal.active,
                products,
            },
        });
    } catch (err) {
        console.error("Error fetching flash deal:", err);
        return res.status(500).json({ success: false, message: "Server error fetching flash deals" });
    }
};

// PUT /flash-deals — upsert the single flash deal config (admin only)
exports.upsertFlashDeal = async (req, res) => {
    try {
        const { title, productIds, active } = req.body;

        // Guard: max 20 products
        const safeIds = Array.isArray(productIds) ? productIds.slice(0, 20) : [];

        let deal = await FlashDeal.findOne({ order: [["id", "ASC"]] });

        if (!deal) {
            deal = await FlashDeal.create({
                title: title || "Flash Deals",
                productIds: safeIds,
                active: active !== undefined ? active : true,
            });
        } else {
            if (title !== undefined) deal.title = title;
            deal.productIds = safeIds;
            if (active !== undefined) deal.active = active;
            await deal.save();
        }

        return res.json({ success: true, message: "Flash deal saved successfully", deal });
    } catch (err) {
        console.error("Error upserting flash deal:", err);
        return res.status(500).json({ success: false, message: "Server error saving flash deal" });
    }
};
