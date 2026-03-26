const MiddleBanner = require('../models/MiddleBanner');

exports.getMiddleBanners = async (req, res) => {
    try {
        const query = req.query.admin ? {} : { isActive: true };
        const banners = await MiddleBanner.findAll({
            where: query,
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json({ success: true, banners });
    } catch (error) {
        console.error("Error fetching middle banners:", error);
        res.status(500).json({ success: false, message: "Failed to fetch banners" });
    }
};

exports.createMiddleBanner = async (req, res) => {
    try {
        const banner = await MiddleBanner.create(req.body);
        res.status(201).json({ success: true, banner });
    } catch (error) {
        console.error("Error creating middle banner:", error);
        res.status(500).json({ success: false, message: "Failed to create banner" });
    }
};

exports.updateMiddleBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await MiddleBanner.findByPk(id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
        
        await banner.update(req.body);
        res.json({ success: true, banner });
    } catch (error) {
        console.error("Error updating middle banner:", error);
        res.status(500).json({ success: false, message: "Failed to update banner" });
    }
};

exports.deleteMiddleBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await MiddleBanner.findByPk(id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
        
        await banner.destroy();
        res.json({ success: true, message: "Banner deleted" });
    } catch (error) {
        console.error("Error deleting middle banner:", error);
        res.status(500).json({ success: false, message: "Failed to delete banner" });
    }
};
