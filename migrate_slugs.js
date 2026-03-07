require("dotenv").config();
const sequelize = require("./config/database");
const Category = require("./models/category");

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");
        
        await sequelize.sync({ alter: true });
        console.log("Database schema synced");
        
        const categories = await Category.findAll();
        for (const cat of categories) {
            if (!cat.slug) {
                const slug = cat.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
                await cat.update({ slug });
                console.log(`Updated ${cat.name} with slug ${slug}`);
            }
        }
        console.log("Migration complete");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
