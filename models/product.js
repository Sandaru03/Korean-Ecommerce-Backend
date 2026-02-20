const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    altNames: {
        type: [String],
        default: [],
    },
    labellPrice: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    images: {
        type: [String],
        default: ["/defult-product.jpg"],
    },
    description: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        required: true,
        default: true,
    },
});

const Product = mongoose.model("products", productSchema);

module.exports = Product;
