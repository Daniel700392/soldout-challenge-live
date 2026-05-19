const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'postgres',
    database: process.env.DB_NAME || 'soldout',
    password: process.env.DB_PASSWORD || 'admin123',
    port: process.env.DB_PORT || 5432,
});

// ¡ESTA ES LA PARTE CRÍTICA QUE FALTABA!
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};