require("dotenv").config();
const sequelize = require("./config/database");
const Category = require("./models/category");
const Product = require("./models/product");

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");
        
        await sequelize.sync({ alter: true });
        console.log("Database schema synced (alter: true)");

        // Clear existing categories to start fresh with the user's list
        await Category.destroy({ where: {}, truncate: false });
        console.log("Cleared existing categories");

        const initialCats = [
            { name: "Skin care", slug: "skin-care", image: "https://picsum.photos/seed/skincare/200/200" },
            { name: "Collagen", slug: "collagen", image: "https://picsum.photos/seed/collagen/200/200" },
            { name: "Hair care", slug: "hair-care", image: "https://picsum.photos/seed/haircare/200/200" },
            { name: "Makeup", slug: "makeup", image: "https://picsum.photos/seed/makeup/200/200" },
            { name: "Body care", slug: "body-care", image: "https://picsum.photos/seed/bodycare/200/200" },
            { name: "Branded items", slug: "branded-items", image: "https://picsum.photos/seed/branded/200/200" },
            { name: "Beauty accessories", slug: "beauty-accessories", image: "https://picsum.photos/seed/acc/200/200" },
            { name: "Baby & Kids", slug: "baby-kids", image: "https://picsum.photos/seed/baby/200/200" },
            { name: "Men's Care", slug: "mens-care", image: "https://picsum.photos/seed/mens/200/200" },
            { name: "Health", slug: "health", image: "https://picsum.photos/seed/health/200/200" },
            { name: "Food", slug: "food", image: "https://picsum.photos/seed/food/200/200" },
            { name: "Home & Kitchen", slug: "home-kitchen", image: "https://picsum.photos/seed/home/200/200" },
            { name: "K-pop", slug: "k-pop", image: "https://picsum.photos/seed/kpop/200/200" },
            { name: "Fashion", slug: "fashion", image: "https://picsum.photos/seed/fashion/200/200" },
            { name: "Give a gift", slug: "give-gift", image: "https://picsum.photos/seed/gift/200/200" },
            { name: "Fancy", slug: "fancy", image: "https://picsum.photos/seed/fancy/200/200" },
            { name: "Electrical items", slug: "electrical-items", image: "https://picsum.photos/seed/elec/200/200" },
            { name: "sports", slug: "sports", image: "https://picsum.photos/seed/sports/200/200" },
            { name: "Pet supplies", slug: "pet-supplies", image: "https://picsum.photos/seed/pet/200/200" },
            { name: "Other", slug: "other", image: "https://picsum.photos/seed/other/200/200" }
        ];

        const mainCats = await Category.bulkCreate(initialCats);
        console.log("Created 20 main categories");

        // Find Skin care ID for nesting
        const skincare = mainCats.find(c => c.name === "Skin care");
        if (skincare) {
            const brands = [
                { name: "Anua", slug: "anua", image: "https://picsum.photos/seed/anua/200/200", parentId: skincare.id },
                { name: "Skin1004", slug: "skin1004", image: "https://picsum.photos/seed/skin1004/200/200", parentId: skincare.id },
                { name: "COSRX", slug: "cosrx", image: "https://picsum.photos/seed/cosrx/200/200", parentId: skincare.id },
                { name: "Beauty of Joseon", slug: "boj", image: "https://picsum.photos/seed/boj/200/200", parentId: skincare.id }
            ];
            await Category.bulkCreate(brands);
            console.log("Created brand subcategories for Skin care");
        }

        // Also update subCategory in products to match new structure
        const prodCount = await Product.count();
        if (prodCount >= 2) {
            // Find COSRX and Anua categories to be safe (though names are used in Product)
            await Product.update({ subCategory: "COSRX" }, { where: { productId: "P1" } });
            await Product.update({ subCategory: "Anua" }, { where: { productId: "P2" } });
        }

        // Add some products if they don't exist
        if (prodCount === 0) {
            const initialProds = [
                {
                    productId: "P1",
                    name: "COSRX Low pH Good Morning Gel Cleanser",
                    description: "A gentle gel cleanser",
                    category: "Skin care",
                    subCategory: "Cleansers",
                    price: 12000,
                    labellPrice: 15000,
                    stock: 100,
                    isAvailable: true,
                    images: ["https://picsum.photos/seed/p1/400/400"]
                },
                {
                    productId: "P2",
                    name: "Anua Heartleaf 77% Soothing Toner",
                    description: "Soothing toner for sensitive skin",
                    category: "Skin care",
                    subCategory: "Cleansers",
                    price: 18000,
                    labellPrice: 22000,
                    stock: 50,
                    isAvailable: true,
                    images: ["https://picsum.photos/seed/p2/400/400"]
                }
            ];
            await Product.bulkCreate(initialProds);
            console.log("Created sample products");
        }

        console.log("Seeding complete successfully");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
