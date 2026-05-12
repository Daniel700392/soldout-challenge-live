const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Esta función crea la tabla automáticamente si no existe
const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY,
      user_id UUID,
      event_id UUID,
      quantity INT,
      status VARCHAR(20),
      request_id UUID UNIQUE
    );
  `;
  try {
    await pool.query(queryText);
    console.log("✅ Conexión a PostgreSQL exitosa y tabla lista");
  } catch (err) {
    console.error("❌ Error al conectar a la DB:", err);
  }
};

module.exports = { pool, initDb };