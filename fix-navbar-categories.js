require('dotenv').config();
const Category = require('./models/category');
const sequelize = require('./config/database');

async function fix() {
    try {
        console.log("Setting showInNavbar = true for all super categories...");
        const [updatedCount] = await Category.update(
            { showInNavbar: true },
            { where: { parentId: null } }
        );
        console.log(`Updated ${updatedCount} categories.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

fix();
