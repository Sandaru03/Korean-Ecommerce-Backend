const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TimeDeal = sequelize.define(
    "TimeDeal",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Time Deals",
        },
        dealEndsAt: {
            type: DataTypes.DATE,
            allowNull: true,
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
    }
);

module.exports = TimeDeal;
