require('dotenv').config();
const seq = require('./config/database');

async function check() {
    try {
        const [tables] = await seq.query('SHOW TABLES');
        for (let tRows of tables) {
            const table = Object.values(tRows)[0];
            const [indexes] = await seq.query(`SHOW INDEX FROM \`${table}\``);
            const indexNames = [...new Set(indexes.map(i => i.Key_name))];
            console.log(`${table}: ${indexNames.length} indexes`);
            if (indexNames.length > 30) {
                console.log(`  Names: ${indexNames.slice(0, 10).join(', ')} ... ${indexNames.slice(-10).join(', ')}`);
            }
        }
    } catch(err) {
        console.error(err);
    } finally {
        await seq.close();
    }
}

check();
