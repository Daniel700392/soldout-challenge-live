const express = require('express');
const dotenv = require('dotenv');
const promClient = require('prom-client');

dotenv.config();
const { v4: uuidv4 } = require('uuid');

const { createBookingSaga, createSeatBookingSaga } = require('./services/booking.service');

const app = express();

promClient.collectDefaultMetrics();

const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total de requests HTTP recibidos',
    labelNames: ['service', 'method', 'route', 'status_code']
});

const httpRequestDurationSeconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duración de requests HTTP en segundos',
    labelNames: ['service', 'method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 3, 5]
});

app.use(express.json());

app.use((req, res, next) => {
    if (req.path === '/metrics') {
        return next();
    }

    const end = httpRequestDurationSeconds.startTimer();

    res.on('finish', () => {
        const route = req.route && req.route.path ? req.route.path : req.path;

        httpRequestsTotal.inc({
            service: 'booking-service',
            method: req.method,
            route,
            status_code: String(res.statusCode)
        });

        end({
            service: 'booking-service',
            method: req.method,
            route,
            status_code: String(res.statusCode)
        });
    });

    next();
});

/**
 * METRICAS Y SALUD (Requisito para Persona 4 - DevOps)
 */
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'booking-service' });
});

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', promClient.register.contentType);
        res.end(await promClient.register.metrics());
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * ENDPOINT PRINCIPAL: Crear Reserva
 * Aquí es donde se orquesta la Saga e Idempotencia
 */
app.post('/bookings', async (req, res) => {
    try {
        const normalizedBody = {
            ...req.body,
            userId: req.body.userId || req.body.user_id,
            eventId: req.body.eventId || req.body.event_id,
            requestId: req.body.requestId || req.body.request_id
        };

        const result = await createBookingSaga(normalizedBody);

        if (result.status === 'EXISTING') {
            return res.status(200).json({
                message: "Reserva ya procesada anteriormente",
                data: result.data
            });
        }

        if (result.status === 'SUCCESS') {
            return res.status(201).json(result.data);
        }

        return res.status(400).json({
            error: result.message,
            status: result.status
        });

    } catch (error) {
        console.error('❌ Error crítico en el flujo de reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/bookings/seat', async (req, res) => {
    try {
        const normalizedBody = {
            ...req.body,
            userId: req.body.userId || req.body.user_id,
            eventId: req.body.eventId || req.body.event_id,
            seatCode: req.body.seatCode || req.body.seat_code,
            requestId: req.body.requestId || req.body.request_id,
            amount: req.body.amount ?? 150
        };
        const result = await createSeatBookingSaga(normalizedBody);
        if (result.status === 'EXISTING') {
            return res.status(200).json({ message: "Reserva de asiento ya procesada anteriormente", data: result.data });
        }
        if (result.status === 'SUCCESS') {
            return res.status(201).json(result.data);
        }
        if (result.status === 'REJECTED') {
            return res.status(409).json({
                error: "El asiento ya no está disponible",
                status: "REJECTED",
                message: "Otro usuario seleccionó este asiento antes. Por favor elige otro."
            });
        }
        return res.status(400).json({ error: result.message, status: result.status });
    } catch (error) {
        console.error('❌ Error crítico en el flujo de reserva de asiento:', error);
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