const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
    "orders",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Sri Lanka",
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        waybillNo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        waybillStatus: {
            type: DataTypes.STRING,
            defaultValue: "unassigned",
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        secondaryPhone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "pending",
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        // Items stored as a JSON array (like MongoDB embedded docs)
        items: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        notes: {
            type: DataTypes.STRING,
            defaultValue: "no additional notes",
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        deliveryFee: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        timestamps: false,
    }
);

module.exports = Order;
