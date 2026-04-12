const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SectionLabel = sequelize.define(
    "SectionLabel",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.STRING(512),
            allowNull: true,
            defaultValue: "",
        },
    },
    {
        timestamps: true,
        tableName: "section_labels",
    }
);

module.exports = SectionLabel;
