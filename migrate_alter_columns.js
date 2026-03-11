/**
 * Migration: Alter the `images` column in products to proper JSON DataType
 * This fixes the issue where Sequelize returns images as a raw string instead of array
 */
require("dotenv").config();
const sequelize = require("./config/database");

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log("Connected to MySQL");

        // Step 1: Change the column type to JSON (this ensures Sequelize auto-parses it)
        await sequelize.query(`ALTER TABLE products MODIFY COLUMN images JSON;`);
        console.log("✅ Column 'images' altered to JSON type");

        // Step 2: Also fix altNames if needed
        await sequelize.query(`ALTER TABLE products MODIFY COLUMN altNames JSON;`);
        console.log("✅ Column 'altNames' altered to JSON type");

        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
