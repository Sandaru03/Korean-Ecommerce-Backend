const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banners', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subtitle: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    heroImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    accent: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    topBannerImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    topInstructionsTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    topInstructionsText: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
    },
    bgGradient: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'from-[#fff0f4] to-[#ffe0ea]',
    },
    bottomInstructionsTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    bottomInstructionsText: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
    },
    bottomInstructionsTip: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    tableName: 'banners',
});

module.exports = Banner;
