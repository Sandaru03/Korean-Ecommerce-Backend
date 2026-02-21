const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// helper: admin guard
function ensureAdmin(req, res) {
    if (!req.user || req.user.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admins only" });
        return false;
    }
    return true;
}

// Create User Signup
exports.createUser = async (req, res) => {
    try {
        const passwordHash = bcrypt.hashSync(req.body.password, 10);
        await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
            role: "customer",
            phone: req.body.phone || "Not Given",
        });
        res.json({ message: "User Created Successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to create user", error: err.message });
    }
};

// Create Admin (Backend)
exports.createAdmin = async (req, res) => {
    try {
        const defaultPassword = "admin123";
        const passwordHash = bcrypt.hashSync(defaultPassword, 10);
        await User.create({
            firstName: "Admin",
            lastName: "User",
            email: req.body.email,
            password: passwordHash,
            role: "admin",
            phone: "Not Given",
            isEmailVerified: true,
        });
        res.json({ message: "Admin Created Successfully with default details" });
    } catch (error) {
        res.status(500).json({ message: "Failed to create admin", error: error.message });
    }
};

// Login Users
exports.LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: "User Not Found" });

        if (user.isBlock)
            return res.status(403).json({ message: "Your account has been blocked. Please contact support." });

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);

        if (isPasswordCorrect) {
            const token = jwt.sign(
                {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isBlock: user.isBlock,
                    isEmailVerified: user.isEmailVerified,
                    image: user.image,
                    userId: user.id,
                },
                process.env.JWT_SECRET
            );
            res.json({ token, message: "Login Successful", role: user.role });
        } else {
            res.status(403).json({ message: "Incorrect Password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login Failed", error: error.message });
    }
};

// isAdmin
exports.isAdmin = (req) => {
    return req.user?.role === "admin";
};

// Current user profile
exports.getUser = async (req, res) => {
    if (!req.user?.email)
        return res.status(401).json({ message: "Unauthorized: No user data found in token" });

    try {
        const user = await User.findOne({ where: { email: req.user.email } });
        if (!user) return res.status(404).json({ message: "User not found in database" });

        res.json({
            firstName: user.firstName || "Not Provided",
            lastName: user.lastName || "Not Provided",
            email: user.email || "Not Provided",
            phone: user.phone || "Not Provided",
            role: user.role || "customer",
            isEmailVerified: user.isEmailVerified || false,
            isBlock: user.isBlock || false,
            image: user.image || null,
            createdAt: user.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user details", error: error.message });
    }
};

/* Customers list + Block/Unblock (Admins only) */
exports.getCustomers = async (req, res) => {
    try {
        const customers = await User.findAll({
            where: { role: "customer" },
            attributes: ["id", "firstName", "lastName", "email", "phone", "role", "isBlock", "isEmailVerified", "createdAt"],
            order: [["createdAt", "DESC"]],
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: "Failed to load customers", error: error.message });
    }
};

exports.setCustomerBlock = async (req, res) => {
    const { email } = req.params;
    const { isBlock } = req.body;

    try {
        const [count] = await User.update(
            { isBlock: !!isBlock },
            { where: { email, role: "customer" } }
        );

        if (count === 0) return res.status(404).json({ message: "Customer not found" });

        const updated = await User.findOne({
            where: { email },
            attributes: ["firstName", "lastName", "email", "phone", "role", "isBlock", "isEmailVerified"],
        });

        res.json({
            message: updated.isBlock ? "Customer blocked" : "Customer unblocked",
            customer: updated,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update block status", error: error.message });
    }
};
