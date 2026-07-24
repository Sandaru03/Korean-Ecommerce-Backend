require('dotenv').config();
const sequelize = require('./config/database');
const QuizBannerConfig = require('./models/QuizBannerConfig');

async function dropTable() {
    try {
        await sequelize.authenticate();
        await QuizBannerConfig.drop();
        console.log("quiz_banner_configs dropped successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error dropping table:", err);
        process.exit(1);
    }
}
dropTable();
