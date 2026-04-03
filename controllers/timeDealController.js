const TimeDeal = require("../models/TimeDeal");
const Product = require("../models/product");

// GET /time-deals — returns the current deal config + full product data
exports.getTimeDeal = async (req, res) => {
    try {
        let deal = await TimeDeal.findOne({ order: [["id", "ASC"]] });

        if (!deal) {
            // Return empty config (no rows yet)
            return res.json({
                success: true,
                deal: {
                    id: null,
                    title: "Time Deals",
                    dealEndsAt: null,
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
                dealEndsAt: deal.dealEndsAt,
                productIds: deal.productIds,
                active: deal.active,
                products,
            },
        });
    } catch (err) {
        console.error("Error fetching time deal:", err);
        return res.status(500).json({ success: false, message: "Server error fetching time deals" });
    }
};

// PUT /time-deals — upsert the single time deal config (admin only)
exports.upsertTimeDeal = async (req, res) => {
    try {
        const { title, dealEndsAt, productIds, active } = req.body;

        // Guard: max 10 products
        const safeIds = Array.isArray(productIds) ? productIds.slice(0, 10) : [];

        let deal = await TimeDeal.findOne({ order: [["id", "ASC"]] });

        if (!deal) {
            deal = await TimeDeal.create({
                title: title || "Time Deals",
                dealEndsAt: dealEndsAt || null,
                productIds: safeIds,
                active: active !== undefined ? active : true,
            });
        } else {
            if (title !== undefined) deal.title = title;
            if (dealEndsAt !== undefined) deal.dealEndsAt = dealEndsAt || null;
            deal.productIds = safeIds;
            if (active !== undefined) deal.active = active;
            await deal.save();
        }

        return res.json({ success: true, message: "Time deal saved successfully", deal });
    } catch (err) {
        console.error("Error upserting time deal:", err);
        return res.status(500).json({ success: false, message: "Server error saving time deal" });
    }
};
