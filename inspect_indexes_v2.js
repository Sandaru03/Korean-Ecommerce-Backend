require('dotenv').config();
const seq = require('./config/database');

async function inspect() {
    try {
        const [tables] = await seq.query('SHOW TABLES');
        for (let tRows of tables) {
            const table = Object.values(tRows)[0];
            const [indexes] = await seq.query(`SHOW INDEX FROM \`${table}\``);
            const indexNames = [...new Set(indexes.map(i => i.Key_name))];
            if (indexNames.length >= 60) {
              console.log(`CRITICAL: Table ${table} has ${indexNames.length} indexes!`);
              console.log(`Indexes: ${indexNames.join(', ')}`);
            } else {
              console.log(`Table: ${table}, Indexes: ${indexNames.length}`);
            }
        }
    } catch(err) {
        console.error('Error during inspection:', err);
    } finally {
        await seq.close();
    }
}

inspect();
