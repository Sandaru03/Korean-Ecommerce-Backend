const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeaturedStrip = sequelize.define(
    "FeaturedStrip",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Featured Products",
        },
        products: {
            type: DataTypes.JSON,
            defaultValue: [],
            get() {
                const raw = this.getDataValue("products");
                if (!raw) return [];
                if (Array.isArray(raw)) return raw;
                if (typeof raw === "string") {
                    try { return JSON.parse(raw); } catch { return []; }
                }
                return [];
            },
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        timestamps: true,
        tableName: "featured_strips",
    }
);

module.exports = FeaturedStrip;
