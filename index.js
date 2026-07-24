const dotenv = require("dotenv");
console.log("====================================");
console.log("BACKEND STARTING: " + new Date().toISOString());
console.log("====================================");
dotenv.config();
const fs = require('fs');
process.on('uncaughtException', (err) => {
  fs.appendFileSync('crash.log', new Date().toISOString() + ' Uncaught Exception: ' + err.stack + '\n');
  console.error("Uncaught Exception written to crash.log", err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  const detail = (reason instanceof Error) ? reason.stack : String(reason);
  fs.appendFileSync('crash.log', new Date().toISOString() + ' Unhandled Rejection: ' + detail + '\n');
  console.error("Unhandled Rejection written to crash.log", reason);
  process.exit(1);
});
process.on('SIGTERM', () => {
  fs.appendFileSync('crash.log', new Date().toISOString() + ' Process killed via SIGTERM\n');
  process.exit(0);
});
process.on('exit', (code) => {
  fs.appendFileSync('crash.log', new Date().toISOString() + ' Process exited with code: ' + code + '\n');
});

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
const bannerRouter = require("./routers/bannerRouter");
const bannerPageRouter = require("./routers/bannerPageRouter");
const adBannerRouter = require("./routers/adBannerRouter");
const reelRouter = require("./routers/reelRouter");
const middleBannerRouter = require("./routers/middleBannerRouter");
const gridBannerRouter = require("./routers/gridBannerRouter");
const timeDealRouter = require("./routers/timeDealRouter");
const configRouter = require("./routers/configRouter");
const sectionLabelRouter = require("./routers/sectionLabelRouter");
const featuredStripRouter = require("./routers/featuredStripRouter");
const flashDealRouter = require("./routers/flashDealRouter");
const galleryReviewRouter = require("./routers/galleryReviewRouter");
const productRequestRouter = require("./routers/productRequestRouter");



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

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
app.use("/banner-sections", bannerRouter);
app.use("/banners", bannerPageRouter);
app.use("/ad-banners", adBannerRouter);
app.use("/reels", reelRouter);
app.use("/middle-banners", middleBannerRouter);
app.use("/grid-banners", gridBannerRouter);
app.use("/time-deals", timeDealRouter);
app.use("/app-configs", configRouter);
app.use("/section-labels", sectionLabelRouter);
app.use("/featured-strip", featuredStripRouter);
app.use("/flash-deals", flashDealRouter);
app.use("/gallery-reviews", galleryReviewRouter);
app.use("/product-requests", productRequestRouter);


// Standard /config path might be blocked by some firewalls/proxies
// Redirecting for backward compatibility if needed, but the frontend should use /app-configs
app.get("/config", (req, res) => res.redirect("/app-configs"));

// Import models here so Sequelize knows to sync them
const Category = require("./models/category");
const HomePageTopic = require("./models/homePageTopic");
const BannerSection = require("./models/bannerSection");
const Banner = require("./models/Banner");
const AdBanner = require("./models/AdBanner");
const Reel = require("./models/Reel");
const MiddleBanner = require("./models/MiddleBanner");
const GridBanner = require("./models/GridBanner");
const TimeDeal = require("./models/TimeDeal");
const SectionLabel = require("./models/SectionLabel");
const FeaturedStrip = require("./models/FeaturedStrip");
const FlashDeal = require("./models/FlashDeal");
const GalleryReview = require("./models/GalleryReview");
const ProductRequest = require("./models/ProductRequest");


// Connect to MySQL and sync tables, then start server
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to MySQL database");
    return sequelize.sync(); // Creates tables if they don't exist, without redundant alters
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