/**
 * Migration: Fix images column in products table
 * - Ensures the column type is JSON
 * - Re-parses any stringified JSON stored as TEXT
 */
require("dotenv").config();
const sequelize = require("./config/database");
const Product = require("./models/product");

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log("Connected to MySQL");

        // 1. Get all products
        const products = await Product.findAll({ raw: true });
        console.log(`Found ${products.length} products to migrate`);

        // 2. Fix any stringified images
        let fixed = 0;
        for (const p of products) {
            let images = p.images;
            let needsFix = false;

            if (typeof images === "string") {
                try {
                    images = JSON.parse(images);
                    needsFix = true;
                } catch {
                    // if not parseable, wrap it in array
                    images = images ? [images] : [];
                    needsFix = true;
                }
            } else if (!Array.isArray(images) || images === null) {
                images = [];
                needsFix = true;
            }

            if (needsFix) {
                await Product.update({ images }, { where: { id: p.id } });
                fixed++;
                console.log(`Fixed product id=${p.id} name="${p.name}"`);
            }
        }

        console.log(`Migration complete. Fixed ${fixed} products.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
