const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("./models/user");

// Routers
const userRouter = require("./routers/userRouter");
const productRouter = require("./routers/productRouter");
const orderRouter = require("./routers/orderRouter");
const reviewRouter = require("./routers/reviewRouter");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Built-in body-parser

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Auth Middleware (Global)
app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  const value = req.header("Authorization");
  if (!value) return next();

  const token = value.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId && decoded.email) {
      try {
        const u = await User.findOne({ email: decoded.email })
          .select("_id role isBlock isEmailVerified image")
          .lean();
        if (!u) {
          return res.status(401).json({ message: "Unauthorized: user not found" });
        }
        decoded.userId = u._id.toString();
        decoded.role = u.role ?? decoded.role;
        decoded.isBlock = u.isBlock ?? decoded.isBlock;
      } catch (lookupErr) {
        console.error("Auth user lookup failed:", lookupErr.message);
        return res.status(500).json({ message: "Auth lookup failed" });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
});

// Routes
app.get("/", (req, res) => {
  res.send("Korean Ecommerce Backend is Running");
});

app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/reviews", reviewRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});