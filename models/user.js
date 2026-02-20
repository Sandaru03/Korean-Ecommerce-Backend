const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            default: "Not Given",
        },
        isBlock: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            default: "customer",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
