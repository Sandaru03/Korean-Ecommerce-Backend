const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        productId: {
            type: String, // Storing ID as string for now, or could be ObjectId if we link to Product
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Optional if guest reviews allowed? But mostly logged in.
        },
        userName: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
