const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
    "categories",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        showInNavbar: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'categories',
                key: 'id'
            }
        },
    },
    {
        timestamps: true,
    }
);

// Define Association
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

module.exports = Category;
