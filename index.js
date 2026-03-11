const dotenv = require("dotenv");
dotenv.config(); // MUST be first — loads .env before any module reads process.env

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const sequelize = require("./config/database");
const User = require("./models/user");

// Routers
const userRouter = require("./routers/userRouter");
const productRouter = require("./routers/productRouter");
const orderRouter = require("./routers/orderRouter");
const reviewRouter = require("./routers/reviewRouter");
const uploadRouter = require("./routers/uploadRouter");
const categoryRouter = require("./routers/categoryRouter");


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Auth Middleware (Global — soft: bad token = unauthenticated, not rejected)
app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  const value = req.header("Authorization");
  if (!value) return next(); // No token — unauthenticated, continue

  const token = value.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId && decoded.email) {
      try {
        const u = await User.findOne({
          where: { email: decoded.email },
          attributes: ["id", "role", "isBlock", "isEmailVerified", "image"],
        });
        if (u) {
          decoded.userId = u.id;
          decoded.role = u.role ?? decoded.role;
          decoded.isBlock = u.isBlock ?? decoded.isBlock;
        }
      } catch (lookupErr) {
        console.error("Auth user lookup failed:", lookupErr.message);
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    // Token is invalid or expired — treat as unauthenticated, do NOT block
    // Routes that require auth will explicitly check req.user
    next();
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
app.use("/upload", uploadRouter);
app.use("/categories", categoryRouter);
app.use("/homepage-topics", require("./routers/homePageTopicRoutes"));

// Import models here so Sequelize knows to sync them
const Category = require("./models/category");
const HomePageTopic = require("./models/homePageTopic");

// Connect to MySQL and sync tables, then start server
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to MySQL database");
    return sequelize.sync({ alter: false }); // Creates tables if they don't exist
  })
  .then(async () => {
    console.log("Database tables synced");

    // Seed default Home Page Topics if they don't exist
    try {
      const topicCount = await HomePageTopic.count();
      if (topicCount === 0) {
        console.log("No Home Page Topics found. Seeding defaults...");
        await HomePageTopic.bulkCreate([
          { title: "Today's Deals", active: true, products: [] },
          { title: "Hot Products", active: true, products: [] },
        ]);
        console.log("Default Home Page Topics seeded successfully.");
      }
    } catch (seedErr) {
      console.error("Error seeding default Home Page Topics:", seedErr.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MySQL:", err.message);
    process.exit(1);
  });