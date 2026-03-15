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
        validate: { min: 1, max: 5 },
        comment: 'Maps to banner 1-5 (hardcoded in frontend)',
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
