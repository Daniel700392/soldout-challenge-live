const express = require('express');
const dotenv = require('dotenv');
// Importamos la lógica de la Saga que creamos en el paso anterior
const { createBookingSaga } = require('./services/booking.service');

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(express.json());

/**
 * METRICAS Y SALUD (Requisito para Persona 4 - DevOps)
 */
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'booking-service' });
});

app.get('/metrics', (req, res) => {
    res.status(200).send('# HELP booking_up Status\n# TYPE booking_up gauge\nbooking_up 1');
});

/**
 * ENDPOINT PRINCIPAL: Crear Reserva
 * Aquí es donde se orquesta la Saga e Idempotencia
 */
app.post('/bookings', async (req, res) => {
    try {
        // Ejecutamos la Saga (Reserva -> Inventario -> Pago)
        const result = await createBookingSaga(req.body);

        // Caso 1: Idempotencia (La reserva ya existía)
        if (result.status === 'EXISTING') {
            return res.status(200).json({
                message: "Reserva ya procesada anteriormente",
                data: result.data
            });
        }

        // Caso 2: Éxito total (Saga completada)
        if (result.status === 'SUCCESS') {
            return res.status(201).json(result.data);
        }

        // Caso 3: Fallos controlados (Sin stock o pago rechazado)
        return res.status(400).json({
            error: result.message,
            status: result.status
        });

    } catch (error) {
        console.error('❌ Error crítico en el flujo de reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * CONSULTA: Ver una reserva por ID
 */
app.get('/bookings/:id', async (req, res) => {
    const db = require('./db/postgres');
    try {
        const result = await db.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró la reserva' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`🚀 Booking Service PROFESIONAL funcionando en puerto ${PORT}`);
});