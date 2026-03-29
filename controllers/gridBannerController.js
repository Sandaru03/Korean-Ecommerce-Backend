const GridBanner = require("../models/GridBanner");

// Initialize default banners if they don't exist
const initBanners = async () => {
    try {
        const count = await GridBanner.count();
        if (count < 6) {
            for (let i = 1; i <= 6; i++) {
                await GridBanner.findOrCreate({
                    where: { position: i },
                    defaults: { image: "", link: "#", position: i }
                });
            }
        }
    } catch (error) {
        console.error("Error initializing grid banners:", error);
    }
};

// Get all grid banners
exports.getBanners = async (req, res) => {
    try {
        await initBanners(); // Ensure we always have the 6 slots
        const banners = await GridBanner.findAll({
            order: [['position', 'ASC']]
        });
        res.status(200).json({ success: true, banners });
    } catch (error) {
        console.error("Error fetching grid banners:", error);
        res.status(500).json({ success: false, message: "Error fetching banners" });
    }
};

// Update a specific grid banner slot
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { image, link } = req.body;

        const banner = await GridBanner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner slot not found" });
        }

        banner.image = image !== undefined ? image : banner.image;
        banner.link = link !== undefined ? link : banner.link;
        await banner.save();

        res.status(200).json({ success: true, message: "Banner updated successfully", banner });
    } catch (error) {
        console.error("Error updating grid banner:", error);
        res.status(500).json({ success: false, message: "Server error updating banner" });
    }
};
