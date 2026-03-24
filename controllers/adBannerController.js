const AdBanner = require('../models/AdBanner');

// Get all ad banners (For Admin)
exports.getAllAdBanners = async (req, res) => {
    try {
        const banners = await AdBanner.findAll({ order: [['order', 'ASC']] });
        res.json({ success: true, banners });
    } catch (error) {
        console.error("Error fetching ad banners:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get only active ad banners (For Frontend Slider)
exports.getActiveAdBanners = async (req, res) => {
    try {
        const banners = await AdBanner.findAll({ 
            where: { isActive: true }, 
            order: [['order', 'ASC']] 
        });
        res.json({ success: true, banners });
    } catch (error) {
        console.error("Error fetching active ad banners:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create a new ad banner
exports.createAdBanner = async (req, res) => {
    try {
        const { image, link, isActive, order } = req.body;
        const banner = await AdBanner.create({ image, link, isActive, order });
        res.status(201).json({ success: true, banner });
    } catch (error) {
        console.error("Error creating ad banner:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update an ad banner
exports.updateAdBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { image, link, isActive, order } = req.body;
        const banner = await AdBanner.findByPk(id);
        
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
        
        await banner.update({ image, link, isActive, order });
        res.json({ success: true, banner });
    } catch (error) {
        console.error("Error updating ad banner:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete an ad banner
exports.deleteAdBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await AdBanner.findByPk(id);
        
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
        
        await banner.destroy();
        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        console.error("Error deleting ad banner:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
