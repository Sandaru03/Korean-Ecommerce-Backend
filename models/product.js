const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
    "products",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        productId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Stored as JSON array in MySQL
        altNames: {
            type: DataTypes.JSON,
            defaultValue: [],
            get() {
                const raw = this.getDataValue('altNames');
                if (!raw) return [];
                if (Array.isArray(raw)) return raw;
                if (typeof raw === 'string') {
                    try { return JSON.parse(raw); } catch { return []; }
                }
                return [];
            },
        },
        labellPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        // Stored as JSON array in MySQL
        images: {
            type: DataTypes.JSON,
            defaultValue: ["/defult-product.jpg"],
            get() {
                const raw = this.getDataValue('images');
                if (!raw) return [];
                if (Array.isArray(raw)) return raw;
                if (typeof raw === 'string') {
                    try {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed) ? parsed : [raw];
                    } catch { return [raw]; }
                }
                return [];
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        miniDescription: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        subCategory: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        superCategory: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        timestamps: false,
    }
);

module.exports = Product;
