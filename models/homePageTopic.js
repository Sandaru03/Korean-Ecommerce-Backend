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
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue('products');
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return []; }
      }
      return [];
    },
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bannerImages: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue('bannerImages');
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return []; }
      }
      return [];
    },
  }
}, {
  timestamps: true,
});

module.exports = HomePageTopic;
