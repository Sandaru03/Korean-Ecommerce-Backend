require("dotenv").config();
const sequelize = require("./config/database");
const Product = require("./models/product");

async function check() {
    try {
        await sequelize.authenticate();
        const products = await Product.findAll({ attributes: ['productId', 'name'] });
        console.log("Found " + products.length + " products:");
        products.forEach(p => console.log(`- ${p.productId}: ${p.name}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
