const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reel = sequelize.define("Reel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brandName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  productPrice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  discountPercentage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  productImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  taglines: {
    type: DataTypes.STRING, // Comma separated tags
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Reel;
