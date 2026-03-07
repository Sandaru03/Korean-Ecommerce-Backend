require('dotenv').config();
const sequelize = require("./config/database");

async function describeTable() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("DESCRIBE categories");
        console.log("Table Description:");
        console.table(results);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

describeTable();
