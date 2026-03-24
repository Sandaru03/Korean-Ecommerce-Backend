require('dotenv').config();
const seq = require('./config/database');

async function clean() {
    try {
        const [tables] = await seq.query('SHOW TABLES');
        const dbName = seq.config.database; // This might be used if needed
        for (let tRows of tables) {
            const tempTableVal = Object.values(tRows);
            const table = tempTableVal[0];
            const [indexes] = await seq.query(`SHOW INDEX FROM \`${table}\``);
            const indexNames = [...new Set(indexes.map(i => i.Key_name))];
            
            for (let idx of indexNames) {
                if (idx !== 'PRIMARY' && /_\d+$/.test(idx)) {
                    await seq.query(`ALTER TABLE \`${table}\` DROP INDEX \`${idx}\``);
                    console.log(`Dropped ${idx} from ${table}`);
                }
            }
        }
        console.log('Done cleaning!');
    } catch(err) {
        console.error(err);
    } finally {
        seq.close();
    }
}

clean();
