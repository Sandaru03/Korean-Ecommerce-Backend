require('dotenv').config();
const seq = require('./config/database');
const fs = require('fs');

async function dropDuplicates() {
    try {
        const data = JSON.parse(fs.readFileSync('db_indexes.json', 'utf8'));
        
        for (const [table, indexes] of Object.entries(data)) {
            // Keep the base ones: 'PRIMARY', 'name', 'slug', 'email', 'productId', 'orderId', 'position'
            // We want to drop the ones ending with _2, _3, _4 etc.
            const toDrop = indexes.filter(idx => /_\d+$/.test(idx));
            
            console.log(`Table ${table} has ${toDrop.length} duplicates to drop.`);
            for (const idx of toDrop) {
                console.log(`Dropping ${idx} from ${table}`);
                await seq.query(`ALTER TABLE \`${table}\` DROP INDEX \`${idx}\``).catch(e => console.log('Failed:', e.message));
            }
        }
        console.log("Cleanup complete.");
    } catch(err) {
        console.error(err);
    } finally {
        seq.close();
    }
}

dropDuplicates();
