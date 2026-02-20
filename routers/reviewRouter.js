const express = require("express");
const { getAllReviews, deleteReview, addReview } = require("../controllers/reviewControllers");
const { isAdmin } = require("../controllers/userControllers");

const reviewRouter = express.Router();

// Middleware to check auth
const ensureAuth = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    next();
};

const ensureAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
};

reviewRouter.get("/all", getAllReviews);
reviewRouter.delete("/:id", deleteReview);
reviewRouter.post("/", ensureAuth, addReview); // Allow users to post reviews

module.exports = reviewRouter;
