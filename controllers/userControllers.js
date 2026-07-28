const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// helper: admin guard
// middleware: admin only
exports.adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
};

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
        const { email, password, firstName, lastName, phone } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                message: "Looks like you're already with us! An account with this email already exists. Try signing in instead." 
            });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        await User.create({
            firstName,
            lastName,
            email,
            password: passwordHash,
            role: "customer",
            phone: phone || "Not Given",
        });
        res.json({ message: "Welcome to the family! Your account has been created successfully." });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "We encountered a small hiccup while creating your account. Please try again in a moment.", error: err.message });
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
            addressLine: user.addressLine || "",
            apartment: user.apartment || "",
            city: user.city || "",
            postalCode: user.postalCode || "",
            country: user.country || "Sri Lanka",
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

exports.updateUser = async (req, res) => {
    if (!req.user?.email)
        return res.status(401).json({ message: "Unauthorized" });

    const { firstName, lastName, phone, addressLine, apartment, city, postalCode, country } = req.body;

    try {
        const [count] = await User.update(
            { firstName, lastName, phone, addressLine, apartment, city, postalCode, country },
            { where: { email: req.user.email } }
        );

        if (count === 0) return res.status(404).json({ message: "User not found" });

        const updated = await User.findOne({
            where: { email: req.user.email },
            attributes: ["firstName", "lastName", "email", "phone", "addressLine", "apartment", "city", "postalCode", "country", "role", "isBlock", "isEmailVerified", "image", "createdAt"],
        });

        res.json({
            message: "Profile updated successfully",
            user: updated,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
};

/* Admin Management (Admins only) */
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.findAll({
            where: { role: "admin" },
            attributes: ["id", "firstName", "lastName", "email", "phone", "role", "createdAt"],
            order: [["createdAt", "DESC"]],
        });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: "Failed to load admins", error: error.message });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "Please provide all required fields (Name, Email, Password)." });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const newAdmin = await User.create({
            firstName,
            lastName,
            email,
            password: passwordHash,
            role: "admin",
            phone: phone || "Not Given",
        });

        res.json({ 
            message: "Success! New admin account created.", 
            admin: {
                id: newAdmin.id,
                email: newAdmin.email,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
                role: newAdmin.role
            }
        });
    } catch (err) {
        console.error("Create Admin error:", err);
        res.status(500).json({ message: "Failed to create admin account.", error: err.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent deleting yourself if needed, but for now simple delete
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "Admin user not found" });
        if (user.role !== 'admin') return res.status(400).json({ message: "This user is not an admin" });

        await user.destroy();
        res.json({ message: "Admin account removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove admin", error: error.message });
    }
};
