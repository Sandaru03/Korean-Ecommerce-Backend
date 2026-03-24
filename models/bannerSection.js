const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BannerSection = sequelize.define('BannerSection', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    bannerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Maps to dynamic banner id',
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    badge: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
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
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: true,
    tableName: 'banner_sections',
});

module.exports = BannerSection;
