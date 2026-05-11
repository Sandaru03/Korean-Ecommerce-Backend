const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GalleryReview = sequelize.define('GalleryReview', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    timestamps: true,
    tableName: 'gallery_reviews',
});

module.exports = GalleryReview;
