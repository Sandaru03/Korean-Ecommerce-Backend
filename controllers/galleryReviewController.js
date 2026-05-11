const GalleryReview = require('../models/GalleryReview');

exports.getAllGalleryReviews = async (req, res) => {
    try {
        const reviews = await GalleryReview.findAll({
            where: { isActive: true },
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.adminGetAllGalleryReviews = async (req, res) => {
    try {
        const reviews = await GalleryReview.findAll({
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addGalleryReview = async (req, res) => {
    try {
        const { image, order, isActive } = req.body;
        const review = await GalleryReview.create({ image, order, isActive });
        res.status(201).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGalleryReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { image, order, isActive } = req.body;
        const review = await GalleryReview.findByPk(id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        await review.update({ image, order, isActive });
        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteGalleryReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await GalleryReview.findByPk(id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        await review.destroy();
        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
