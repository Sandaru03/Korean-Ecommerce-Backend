require('dotenv').config();
const sequelize = require('../config/database');

async function check() {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");

        const [results] = await sequelize.query(`
            SELECT TABLE_NAME, COUNT(DISTINCT INDEX_NAME) AS index_count 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            GROUP BY TABLE_NAME 
            ORDER BY index_count DESC;
        `);
        console.log("Index counts per table:");
        console.table(results);

        // For tables with many indexes, list the indexes
        for (const row of results) {
            if (row.index_count > 10) {
                console.log(`\nIndexes on table ${row.TABLE_NAME}:`);
                const [idx] = await sequelize.query(`
                    SHOW INDEXES FROM \`${row.TABLE_NAME}\`;
                `);
                console.log(`Total: ${idx.length} index entries. Unique index names:`, [...new Set(idx.map(i => i.Key_name))]);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
