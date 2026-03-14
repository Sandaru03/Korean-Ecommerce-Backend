require("dotenv").config();
const sequelize = require("./config/database");
const Product = require("./models/product");
const HomePageTopic = require("./models/homePageTopic");

async function cleanup() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");

        // Delete all products
        await Product.destroy({ where: {}, truncate: false });
        console.log("Cleared all products from 'products' table");

        // Clear products in HomePageTopics
        const topics = await HomePageTopic.findAll();
        for (const topic of topics) {
            await topic.update({ products: [] });
        }
        console.log("Cleared product lists in all HomePageTopics");

        process.exit(0);
    } catch (err) {
        console.error("Cleanup failed:", err);
        process.exit(1);
    }
}
cleanup();
