require('dotenv').config();
const sequelize = require('../config/database');

async function cleanup() {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");

        const [tables] = await sequelize.query(`
            SELECT DISTINCT TABLE_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE();
        `);

        for (const { TABLE_NAME } of tables) {
            const [indexes] = await sequelize.query(`
                SHOW INDEXES FROM \`${TABLE_NAME}\`;
            `);

            const uniqueIndexNames = [...new Set(indexes.map(i => i.Key_name))];
            
            // Find duplicate indexes like email_2, email_3, productId_2, etc.
            const duplicates = uniqueIndexNames.filter(name => {
                if (name === 'PRIMARY') return false;
                // If it ends with _<number>, it's a Sequelize alter duplicate
                return /_\d+$/.test(name);
            });

            if (duplicates.length > 0) {
                console.log(`Found ${duplicates.length} duplicate indexes on table ${TABLE_NAME}. Cleaning up...`);
                for (const dup of duplicates) {
                    try {
                        await sequelize.query(`ALTER TABLE \`${TABLE_NAME}\` DROP INDEX \`${dup}\`;`);
                        // console.log(`  Dropped ${dup} from ${TABLE_NAME}`);
                    } catch (dropErr) {
                        console.error(`  Failed to drop ${dup} from ${TABLE_NAME}:`, dropErr.message);
                    }
                }
                console.log(`Successfully cleaned up table ${TABLE_NAME}`);
            }
        }

        console.log("\nAll duplicate indexes cleaned up! Re-checking table index counts:");
        const [results] = await sequelize.query(`
            SELECT TABLE_NAME, COUNT(DISTINCT INDEX_NAME) AS index_count 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            GROUP BY TABLE_NAME 
            ORDER BY index_count DESC;
        `);
        console.table(results);
        process.exit(0);
    } catch (err) {
        console.error("Cleanup error:", err);
        process.exit(1);
    }
}

cleanup();
