const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        port: process.env.DB_PORT || 3306,
        logging: false, // set to console.log to see SQL queries
        define: {
            charset: "utf8mb4",
            collate: "utf8mb4_unicode_ci",
        },
    }
);

module.exports = sequelize;
