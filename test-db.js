const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    const configs = [
        { host: 'localhost', port: 3306, user: process.env.DB_USER, password: process.env.DB_PASSWORD },
        { host: '127.0.0.1', port: 3306, user: process.env.DB_USER, password: process.env.DB_PASSWORD },
        { host: 'localhost', port: 3307, user: process.env.DB_USER, password: process.env.DB_PASSWORD }
    ];

    for (const config of configs) {
        console.log(`Testing connection to ${config.host}...`);
        try {
            const connection = await mysql.createConnection(config);
            console.log(`✅ Successfully connected to ${config.host}`);
            await connection.end();
        } catch (err) {
            console.error(`❌ Failed to connect to ${config.host}:`, err.message);
        }
    }
}

testConnection();
