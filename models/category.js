const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
    "categories",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // Stored as JSON array of objects: [{ name: "Sub1", image: "url1" }, ...]
        subcategories: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Category;
