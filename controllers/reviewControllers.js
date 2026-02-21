const Review = require("../models/review");

// Get all reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({ order: [["createdAt", "DESC"]] });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await Review.destroy({ where: { id } });

        if (count === 0) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete review", error: error.message });
    }
};

// Add a review
exports.addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const review = await Review.create({
            productId,
            userId: req.user.userId,
            userName: req.user.firstName + " " + req.user.lastName,
            rating,
            comment,
        });
        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Failed to add review", error: error.message });
    }
};
