const Banner = require('../models/Banner');
const BannerSection = require('../models/bannerSection');

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, banners });
    } catch (error) {
        console.error("Error fetching banners:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
        res.json({ success: true, banner });
    } catch (error) {
        console.error("Error fetching banner:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const { title, subtitle, heroImage, accent, topBannerImage, topInstructionsTitle, topInstructionsText, bgGradient, bottomInstructionsTitle, bottomInstructionsText, bottomInstructionsTip, isActive } = req.body;
        
        if (!title) return res.status(400).json({ success: false, message: "Title is required" });

        const banner = await Banner.create({
            title, subtitle, heroImage, accent, topBannerImage, topInstructionsTitle, topInstructionsText, bgGradient, bottomInstructionsTitle, bottomInstructionsText, bottomInstructionsTip, isActive
        });

        res.status(201).json({ success: true, banner });
    } catch (error) {
        console.error("Error creating banner:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

        await banner.update(req.body);
        res.json({ success: true, banner });
    } catch (error) {
        console.error("Error updating banner:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

        // First delete sections associated with this banner
        await BannerSection.destroy({ where: { bannerId: id } });
        
        // Delete banner
        await banner.destroy();
        
        res.json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        console.error("Error deleting banner:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
