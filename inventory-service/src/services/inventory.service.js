const pool = require('../db/postgres');
const { client: redisClient } = require('../redis/redisClient');
const promClient = require('prom-client');

const reserveSuccess = new promClient.Counter({
  name: 'inventory_reserve_success_total',
  help: 'Total successful inventory reservations',
});

const reserveFailed = new promClient.Counter({
  name: 'inventory_reserve_failed_total',
  help: 'Total failed inventory reservations',
});

const releaseSuccess = new promClient.Counter({
  name: 'inventory_release_success_total',
  help: 'Total successful inventory releases',
});

const soldOutCounter = new promClient.Counter({
  name: 'inventory_soldout_total',
  help: 'Total reservation attempts rejected because of insufficient stock',
});

async function getInventory(eventId) {
  const result = await pool.query(
    `
    SELECT id, event_id, available_tickets, reserved_tickets
    FROM inventory
    WHERE event_id = $1
    `,
    [eventId]
  );

  if (result.rows.length === 0) {
    throw new Error('Inventory not found');
  }

  return result.rows[0];
}

async function reserveTickets(eventId, quantity, requestId) {
  const lockKey = `lock:event:${eventId}`;
  const idempotencyKey = `inventory:request:${requestId}`;

  const previousResult = await redisClient.get(idempotencyKey);

  if (previousResult) {
    return JSON.parse(previousResult);
  }

let lock = null;

for (let attempt = 1; attempt <= 10; attempt++) {
  lock = await redisClient.set(lockKey, 'locked', {
    NX: true,
    EX: 5,
  });

  if (lock) break;

  await new Promise((resolve) => setTimeout(resolve, 100));
}

if (!lock) {
  reserveFailed.inc();
  throw new Error('Could not acquire inventory lock after retries');
}

  const clientDb = await pool.connect();

  try {
    await clientDb.query('BEGIN');

    const inventoryResult = await clientDb.query(
      `
      SELECT available_tickets, reserved_tickets
      FROM inventory
      WHERE event_id = $1
      FOR UPDATE
      `,
      [eventId]
    );

    const inventory = inventoryResult.rows[0];

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    if (inventory.available_tickets < quantity) {
      soldOutCounter.inc();
      throw new Error('Not enough tickets available');
    }

    await clientDb.query(
      `
      UPDATE inventory
      SET available_tickets = available_tickets - $1,
          reserved_tickets = reserved_tickets + $1
      WHERE event_id = $2
        AND available_tickets >= $1
      `,
      [quantity, eventId]
    );

    await clientDb.query('COMMIT');

    const response = {
      success: true,
      eventId,
      quantity,
      requestId,
      message: 'Tickets reserved successfully',
    };

    await redisClient.set(idempotencyKey, JSON.stringify(response), {
      EX: 3600,
    });

    reserveSuccess.inc();

    return response;
  } catch (error) {
    await clientDb.query('ROLLBACK');
    reserveFailed.inc();
    throw error;
  } finally {
    clientDb.release();
    await redisClient.del(lockKey);
  }
}

async function releaseTickets(eventId, quantity) {
  const clientDb = await pool.connect();

  try {
    await clientDb.query('BEGIN');

    const inventoryResult = await clientDb.query(
      `
      SELECT available_tickets, reserved_tickets
      FROM inventory
      WHERE event_id = $1
      FOR UPDATE
      `,
      [eventId]
    );

    const inventory = inventoryResult.rows[0];

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    if (inventory.reserved_tickets < quantity) {
      throw new Error('Not enough reserved tickets to release');
    }

    await clientDb.query(
      `
      UPDATE inventory
      SET available_tickets = available_tickets + $1,
          reserved_tickets = reserved_tickets - $1
      WHERE event_id = $2
        AND reserved_tickets >= $1
      `,
      [quantity, eventId]
    );

    await clientDb.query('COMMIT');

    releaseSuccess.inc();

    return {
      success: true,
      eventId,
      quantity,
      message: 'Tickets released successfully',
    };
  } catch (error) {
    await clientDb.query('ROLLBACK');
    throw error;
  } finally {
    clientDb.release();
  }
}
// Seat related functions

async function listEvents() {
  const result = await pool.query(`
    SELECT id, name, venue, event_date, created_at
    FROM events
    ORDER BY event_date NULLS LAST, created_at DESC
  `);
  return result.rows;
}

async function getSeats(eventId) {
  const result = await pool.query(`
    SELECT id, event_id, seat_code, section, row_label, seat_number, status,
           reserved_by, booking_id, reserved_at, created_at
    FROM event_seats
    WHERE event_id = $1
    ORDER BY row_label, seat_number
  `, [eventId]);
  return result.rows;
}

async function reserveSeat(eventId, seatCode, userId, bookingId) {
  const result = await pool.query(`
    UPDATE event_seats
    SET status = 'RESERVED',
        reserved_by = $1,
        booking_id = $2,
        reserved_at = NOW()
    WHERE event_id = $3
      AND seat_code = $4
      AND status = 'AVAILABLE'
    RETURNING *
  `, [userId, bookingId, eventId, seatCode]);

  if (result.rowCount === 0) {
    const error = new Error('Seat already reserved or sold');
    error.code = 'SEAT_CONFLICT';
    throw error;
  }

  return result.rows[0];
}

async function releaseSeat(eventId, seatCode, bookingId) {
  const result = await pool.query(`
    UPDATE event_seats
    SET status = 'AVAILABLE',
        reserved_by = NULL,
        booking_id = NULL,
        reserved_at = NULL
    WHERE event_id = $1
      AND seat_code = $2
      AND booking_id = $3
      AND status = 'RESERVED'
    RETURNING *
  `, [eventId, seatCode, bookingId]);

  if (result.rowCount === 0) {
    const error = new Error('Seat cannot be released');
    throw error;
  }

  return result.rows[0];
}

async function confirmSeat(eventId, seatCode, bookingId) {
  const result = await pool.query(`
    UPDATE event_seats
    SET status = 'SOLD'
    WHERE event_id = $1
      AND seat_code = $2
      AND booking_id = $3
      AND status = 'RESERVED'
    RETURNING *
  `, [eventId, seatCode, bookingId]);

  if (result.rowCount === 0) {
    const error = new Error('Seat cannot be confirmed');
    throw error;
  }

  return result.rows[0];
}

// Export
module.exports = {
  getInventory,
  reserveTickets,
  releaseTickets,
  reserveSeat,
  releaseSeat,
  confirmSeat,
  getSeats,
  listEvents,
};