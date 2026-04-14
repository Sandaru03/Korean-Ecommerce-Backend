const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdBanner = sequelize.define('AdBanner', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    slot: {
        type: DataTypes.INTEGER,
        defaultValue: 1, // 1 = after grid banners, 2 = after 5th topic
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'ad_banners',
});

module.exports = AdBanner;
