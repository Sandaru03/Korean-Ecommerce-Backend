const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
    "users",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            defaultValue: "Not Given",
        },
        isBlock: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: "customer",
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        addressLine: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        apartment: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
            defaultValue: "Sri Lanka",
        },
        image: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = User;
