require('dotenv').config();
const Category = require("./models/category");
const sequelize = require("./config/database");

async function check() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        const cats = await Category.findAll();
        console.log("Current Categories:");
        cats.forEach(c => {
            console.log(`ID: ${c.id}, Name: ${c.name}, Subcategories (RAW): ${JSON.stringify(c.subcategories)}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
