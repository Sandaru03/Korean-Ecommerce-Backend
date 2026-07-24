const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizBannerConfig = sequelize.define('QuizBannerConfig', {
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
        defaultValue: '/quiz',
    },
    quizPageImage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    tableName: 'quiz_banner_configs',
});

module.exports = QuizBannerConfig;
