const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FlashDeal = sequelize.define(
    "FlashDeal",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Flash Deals",
        },
        productIds: {
            type: DataTypes.JSON,
            defaultValue: [],
            get() {
                const raw = this.getDataValue("productIds");
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
        tableName: "flash_deals",
    }
);

module.exports = FlashDeal;
