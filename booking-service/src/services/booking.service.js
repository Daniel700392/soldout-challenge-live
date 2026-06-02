const db = require('../db/postgres');
const inventoryClient = require('../clients/inventory.client');
const paymentClient = require('../clients/payment.client');
const { v4: uuidv4 } = require('uuid');

const createSeatBookingSaga = async (bookingData) => {
  const { userId, eventId, seatCode, requestId, amount = 150 } = bookingData;

  // Idempotency check
  const existing = await db.query('SELECT * FROM bookings WHERE request_id = $1', [requestId]);
  if (existing.rows.length > 0) {
    return { status: 'EXISTING', data: existing.rows[0] };
  }

  // Generate booking id but do NOT persist yet
  const bookingId = uuidv4();

  try {
    // Reserve seat first (passes provisional bookingId)
    await inventoryClient.reserveSeat(eventId, seatCode, requestId, bookingId);

    // Now insert the booking record as PENDING
    const newBooking = await db.query(
      `INSERT INTO bookings (id, user_id, event_id, seat_code, request_id, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [bookingId, userId, eventId, seatCode, requestId, 'PENDING']
    );
    const booking = newBooking.rows[0];

    try {
      // Process payment
      const paymentResult = await paymentClient.processPayment(booking.id, amount);
      if (paymentResult.status !== 'COMPLETED') {
        throw new Error('PAYMENT_FAILED');
      }

      // Confirm seat
      await inventoryClient.confirmSeat(eventId, seatCode, booking.id);

      // Update booking status to CONFIRMED
      const confirmed = await db.query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
        ['CONFIRMED', booking.id]
      );
      return { status: 'SUCCESS', data: confirmed.rows[0] };
    } catch (payError) {
      // Payment failed – release seat and mark booking CANCELLED
      await inventoryClient.releaseSeat(eventId, seatCode, booking.id);
      await db.query('UPDATE bookings SET status = $1 WHERE id = $2', ['CANCELLED', booking.id]);
      return { status: 'CANCELLED', message: 'Pago fallido, reserva cancelada' };
    }
  } catch (invError) {
    // Seat reservation failure
    if (invError.message === 'SEAT_CONTENTION') {
      // Do NOT create a booking row for contention; surface REJECTED response
      return { status: 'REJECTED', message: 'El asiento ya no está disponible' };
    }
    // For other inventory errors, create a FAILED booking record for audit
    await db.query(
      `INSERT INTO bookings (id, user_id, event_id, seat_code, request_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [bookingId, userId, eventId, seatCode, requestId, 'FAILED']
    );
    return { status: 'FAILED', message: invError.message };
  }
};

const createBookingSaga = async (bookingData) => {
  const { userId, eventId, quantity, requestId, amount = 150 } = bookingData;

  const existing = await db.query('SELECT * FROM bookings WHERE request_id = $1', [requestId]);
  if (existing.rows.length > 0) {
    return { status: 'EXISTING', data: existing.rows[0] };
  }

  const bookingId = uuidv4();
  const newBooking = await db.query(
    `INSERT INTO bookings (id, user_id, event_id, quantity, request_id, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [bookingId, userId, eventId, quantity, requestId, 'PENDING']
  );
  const booking = newBooking.rows[0];

  try {
    await inventoryClient.reserveInventory(eventId, quantity, requestId);
    try {
      const paymentResult = await paymentClient.processPayment(booking.id, amount);
      if (paymentResult.status !== 'COMPLETED') {
        throw new Error('PAYMENT_FAILED');
      }
      const confirmed = await db.query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
        ['CONFIRMED', booking.id]
      );
      return { status: 'SUCCESS', data: confirmed.rows[0] };
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

module.exports = {
  createBookingSaga,
  createSeatBookingSaga,
};