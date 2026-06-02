const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
  user: process.env.DB_USER || process.env.POSTGRES_USER || 'admin',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'admin',
  database: process.env.DB_NAME || process.env.POSTGRES_DB || 'soldout',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;