const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GridBanner = sequelize.define(
    "GridBanner",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "#",
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // 1 through 6
        },
    },
    {
        timestamps: true,
    }
);

module.exports = GridBanner;
