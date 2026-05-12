require('dotenv').config(); // Carga las variables del archivo .env
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool, initDb } = require('./db/postgres'); // Importamos la conexión real
const app = express();
app.use(express.json());

// 1. REGLA CRÍTICA: Iniciamos la base de datos y creamos la tabla si no existe
initDb();

// ENDPOINT PRINCIPAL: Crear una reserva
app.post('/bookings', async (req, res) => {
    const { event_id, user_id, quantity, request_id } = req.body;

    try {
        // 2. REGLA CRÍTICA: Idempotencia (Usando la DB real)
        // Buscamos si ya existe ese request_id en PostgreSQL
        const existing = await pool.query('SELECT * FROM bookings WHERE request_id = $1', [request_id]);
        
        if (existing.rows.length > 0) {
            return res.status(200).json({ 
                message: "Esta reserva ya fue procesada anteriormente", 
                booking: existing.rows[0] 
            });
        }

        // 3. Crear la reserva en estado PENDING (Saga Pattern)
        const id = uuidv4();
        const queryText = `
            INSERT INTO bookings (id, event_id, user_id, quantity, status, request_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
        const values = [id, event_id, user_id, quantity, 'PENDING', request_id];
        
        const result = await pool.query(queryText, values);
        
        console.log(`[Booking] Reserva guardada en DB (PENDING): ${id}`);
        
        // Respondemos con los datos que se guardaron en la tabla
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("❌ Error al procesar reserva:", err);
        res.status(500).json({ error: "Error interno del servidor al guardar en DB" });
    }
});

// Endpoint para ver todas las reservas (Trae los datos reales de PostgreSQL)
app.get('/bookings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al consultar la DB" });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`✅ Booking Service con PostgreSQL funcionando en puerto ${PORT}`);
});