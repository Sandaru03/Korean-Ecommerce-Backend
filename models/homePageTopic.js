const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product');

const HomePageTopic = sequelize.define('HomePageTopic', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  products: {
    type: DataTypes.JSON, // Array of product ObjectIds (as strings) since we don't have explicit joins yet
    defaultValue: [],
  }
}, {
  timestamps: true,
});

module.exports = HomePageTopic;
