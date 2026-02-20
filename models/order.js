const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "pending",
    },
    date: {
        type: Date,
        default: Date.now,
    },
    items: [
        {
            productId: {
                type: String,
                required: true,
            },
            productName: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            qty: {
                type: Number,
                required: true,
            },
        },
    ],
    notes: {
        type: String,
        default: "no additional notes",
    },
    total: {
        type: Number,
        required: true,
        default: 0,
    },
});

const Order = mongoose.model("order", orderSchema);

module.exports = Order;
