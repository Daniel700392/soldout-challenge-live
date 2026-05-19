const db = require('../db/postgres');
const inventoryClient = require('../clients/inventory.client');
const paymentClient = require('../clients/payment.client');
const { v4: uuidv4 } = require('uuid');

const createBookingSaga = async (bookingData) => {
    const { userId, eventId, quantity, requestId, amount = 150 } = bookingData;

    const existing = await db.query('SELECT * FROM bookings WHERE request_id = $1', [requestId]);
    if (existing.rows.length > 0) {
        return { status: 'EXISTING', data: existing.rows[0] };
    }

    const bookingId = uuidv4();
    const newBooking = await db.query(
        'INSERT INTO bookings (id, user_id, event_id, quantity, request_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [bookingId, userId, eventId, quantity, requestId, 'PENDING']
    );
    const booking = newBooking.rows[0];

    try {
        await inventoryClient.reserveInventory(eventId, quantity, requestId);

        try {
            const paymentResult = await paymentClient.processPayment(booking.id, amount);
            console.log('paymentResult:', paymentResult);

            if (paymentResult.status === 'COMPLETED') {
                const confirmed = await db.query(
                    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
                    ['CONFIRMED', booking.id]
                );
                return { status: 'SUCCESS', data: confirmed.rows[0] };
            } else {
                throw new Error('PAYMENT_FAILED');
            }
        } catch (payError) {
            await inventoryClient.releaseInventory(eventId, quantity, requestId);
            await db.query('UPDATE bookings SET status = $1 WHERE id = $2', ['CANCELLED', booking.id]);
            return { status: 'CANCELLED', message: 'Pago fallido, reserva cancelada' };
        }
    } catch (invError) {
        await db.query('UPDATE bookings SET status = $1 WHERE id = $2', ['FAILED', booking.id]);
        return { status: 'FAILED', message: 'No hay stock disponible' };
    }
};

// ¡ESTA ES LA OTRA PARTE CRÍTICA QUE FALTABA!
module.exports = { createBookingSaga };