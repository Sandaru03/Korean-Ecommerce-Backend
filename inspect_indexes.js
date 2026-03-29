require('dotenv').config();
const seq = require('./config/database');

async function inspect() {
    try {
        const [tables] = await seq.query('SHOW TABLES');
        for (let tRows of tables) {
            const tempTableVal = Object.values(tRows);
            const table = tempTableVal[0];
            const [indexes] = await seq.query(`SHOW INDEX FROM \`${table}\``);
            const indexNames = [...new Set(indexes.map(i => i.Key_name))];
            console.log(`Table: ${table}, Index Count: ${indexNames.length}`);
            if (indexNames.length > 50) {
                console.log(`  Indices: ${indexNames.join(', ')}`);
            }
        }
    } catch(err) {
        console.error(err);
    } finally {
        seq.close();
    }
}

inspect();
