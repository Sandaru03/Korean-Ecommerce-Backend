const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// helper: admin guard
function ensureAdmin(req, res) {
    if (!req.user || req.user.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admins only" });
        return false;
    }
    return true;
}

// Create User Signup
exports.createUser = (req, res) => {
    const passwordHash = bcrypt.hashSync(req.body.password, 10);

    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: passwordHash,
        role: "customer",
        phone: req.body.phone || "Not Given",
    };

    const user = new User(userData);

    user
        .save()
        .then(() => res.json({ message: "User Created Successfully" }))
        .catch((err) => res.status(500).json({ message: "Failed to create user", error: err.message }));
};

// Create Admin (Backend)
exports.createAdmin = (req, res) => {
    const defaultPassword = "admin123";
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    const userData = {
        firstName: "Admin",
        lastName: "User",
        email: req.body.email,
        password: passwordHash,
        role: "admin",
        phone: "Not Given",
        isEmailVerified: true,
    };

    const user = new User(userData);

    user
        .save()
        .then(() =>
            res.json({ message: "Admin Created Successfully with default details" })
        )
        .catch((error) =>
            res.status(500).json({ message: "Failed to create admin", error: error.message })
        );
};

// login Users
exports.LoginUser = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then((user) => {
            if (!user) return res.status(404).json({ message: "User Not Found" });

            if (user.isBlock)
                return res
                    .status(403)
                    .json({ message: "Your account has been blocked. Please contact support." });

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
                        userId: user._id, // Adding userId directly to token
                    },
                    process.env.JWT_SECRET
                );

                res.json({ token, message: "Login Successful", role: user.role });
            } else {
                res.status(403).json({ message: "Incorrect Password" });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Login Failed", error: error.message });
        });
};

// isAdmin
exports.isAdmin = (req) => {
    return req.user?.role === "admin";
};

// Current user profile
exports.getUser = (req, res) => {
    if (!req.user?.email)
        return res.status(401).json({ message: "Unauthorized: No user data found in token" });

    User.findOne({ email: req.user.email })
        .then((user) => {
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
        })
        .catch((error) =>
            res.status(500).json({ message: "Failed to fetch user details", error: error.message })
        );
};

/* Customers list + Block/Unblock (Admins only) */
exports.getCustomers = async (req, res) => {
    // if (!ensureAdmin(req, res)) return;

    try {
        const customers = await User.find({ role: "customer" })
            .select("firstName lastName email phone role isBlock isEmailVerified createdAt")
            .sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: "Failed to load customers", error: error.message });
    }
};

exports.setCustomerBlock = async (req, res) => {
    // if (!ensureAdmin(req, res)) return;

    const { email } = req.params;
    const { isBlock } = req.body;

    try {
        const updated = await User.findOneAndUpdate(
            { email, role: "customer" },
            { isBlock: !!isBlock },
            {
                new: true,
                projection: "firstName lastName email phone role isBlock isEmailVerified",
            }
        );

        if (!updated) return res.status(404).json({ message: "Customer not found" });

        res.json({
            message: updated.isBlock ? "Customer blocked" : "Customer unblocked",
            customer: updated,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update block status", error: error.message });
    }
};
