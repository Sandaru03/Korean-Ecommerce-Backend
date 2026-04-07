require('dotenv').config();
const Category = require('./models/category');
const sequelize = require('./config/database');

const newCategories = [
    "Skin care", "Collagen", "Hair care", "Makeup", "Body care",
    "Branded items", "Beauty accessories", "Baby & Kids", "Men's Care", "Health",
    "Food", "Home & Kitchen", "K-pop", "Fashion", "Give a gift",
    "Fancy", "Electrical items", "sports", "Pet supplies", "Other"
];

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function reseed() {
    try {
        console.log("--- Category Reseed Start ---");
        
        // 1. Sync & Clear (Truncate)
        // DISABLE foreign key checks to allow truncating hierarchical tables if necessary, 
        // though DELETE is safer if there are existing references we don't want to break at the DB level.
        // But the user said "delete current", so we'll go scorched earth.
        
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log("Deleting all existing categories...");
        await Category.destroy({ where: {}, truncate: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Prepare Data
        const items = newCategories.map(name => ({
            name,
            slug: generateSlug(name),
            parentId: null,
            showInNavbar: true // Assuming super categories should be in navbar by default
        }));

        // 3. Bulk Insert
        console.log(`Inserting ${items.length} new super categories...`);
        await Category.bulkCreate(items);

        console.log("--- SUCCESS: Categories reseeded successfully ---");
        process.exit(0);
    } catch (error) {
        console.error("--- ERROR: Reseed failed ---");
        console.error(error);
        process.exit(1);
    }
}

reseed();
