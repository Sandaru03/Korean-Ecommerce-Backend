require('dotenv').config();
const sequelize = require("./config/database");

async function checkRaw() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT * FROM categories");
        console.log("Current Categories (RAW SQL):");
        results.forEach(r => {
            console.log(`ID: ${r.id}, Name: ${r.name}, Subcategories: ${r.subcategories}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRaw();
