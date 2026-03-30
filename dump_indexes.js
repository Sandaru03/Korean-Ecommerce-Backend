require('dotenv').config();
const fs = require('fs');
const seq = require('./config/database');

async function dump() {
    let result = {};
    try {
        const [tables] = await seq.query('SHOW TABLES');
        for (let tRows of tables) {
            const tempTableVal = Object.values(tRows);
            const table = tempTableVal[0];
            const [indexes] = await seq.query(`SHOW INDEX FROM \`${table}\``);
            const indexNames = [...new Set(indexes.map(i => i.Key_name))];
            if (indexNames.length > 3) {
                result[table] = indexNames;
            }
        }
        fs.writeFileSync('db_indexes.json', JSON.stringify(result, null, 2));
        console.log("Done");
    } catch(err) {
        console.error(err);
    } finally {
        seq.close();
    }
}

dump();
