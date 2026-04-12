const SectionLabel = require("../models/SectionLabel");

// GET /section-labels — returns { gridBannerTitle: "...", middleBannerTitle: "...", ... }
exports.getLabels = async (req, res) => {
    try {
        const rows = await SectionLabel.findAll();
        const labels = {};
        rows.forEach(row => { labels[row.key] = row.value; });
        res.json({ success: true, labels });
    } catch (error) {
        console.error("Error fetching section labels:", error);
        res.status(500).json({ success: false, message: "Failed to fetch section labels" });
    }
};

// PUT /section-labels/:key — upsert the value for a given key
exports.upsertLabel = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const [row, created] = await SectionLabel.findOrCreate({
            where: { key },
            defaults: { key, value: value ?? "" },
        });

        if (!created) {
            row.value = value ?? "";
            await row.save();
        }

        res.json({ success: true, label: { key: row.key, value: row.value } });
    } catch (error) {
        console.error("Error upserting section label:", error);
        res.status(500).json({ success: false, message: "Failed to save section label" });
    }
};
