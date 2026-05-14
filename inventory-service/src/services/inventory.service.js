const pool = require('../db/postgres');
const redisClient = require('../redis/redisClient');
const client = require('prom-client');

const reserveSuccess = new client.Counter({
  name: 'inventory_reserve_success_total',
  help: 'Reservas exitosas'
});

const reserveFailed = new client.Counter({
  name: 'inventory_reserve_failed_total',
  help: 'Reservas fallidas'
});

const soldOutCounter = new client.Counter({
  name: 'inventory_soldout_total',
  help: 'Intentos sin stock'
});

const releaseSuccess = new client.Counter({
  name: 'inventory_release_success_total',
  help: 'Liberaciones exitosas'
});

async function getInventory(eventId) {

  const result = await pool.query(
    'SELECT * FROM inventory WHERE event_id = $1',
    [eventId]
  );

  return result.rows[0];
}

async function reserveTickets(eventId, quantity) {

  const lockKey = `lock:event:${eventId}`;

  const lock = await redisClient.set(lockKey, 'locked', {
    NX: true,
    EX: 5
  });

  if (!lock) {
    throw new Error('Could not acquire lock');
  }

  const clientDb = await pool.connect();

  try {

    await clientDb.query('BEGIN');

    const inventoryResult = await clientDb.query(
      `
      SELECT available_tickets
      FROM inventory
      WHERE event_id = $1
      FOR UPDATE
      `,
      [eventId]
    );

    const inventory = inventoryResult.rows[0];

    if (!inventory) {

      await clientDb.query('ROLLBACK');

      throw new Error('Inventory not found');
    }

    if (inventory.available_tickets < quantity) {

      soldOutCounter.inc();
      reserveFailed.inc();

      await clientDb.query('ROLLBACK');

      throw new Error('Not enough tickets available');
    }

    await clientDb.query(
      `
      UPDATE inventory
      SET available_tickets = available_tickets - $1,
          reserved_tickets = reserved_tickets + $1
      WHERE event_id = $2
      `,
      [quantity, eventId]
    );

    await clientDb.query('COMMIT');

    reserveSuccess.inc();

    return {
      success: true
    };

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

  await pool.query(
    `
    UPDATE inventory
    SET available_tickets = available_tickets + $1,
        reserved_tickets = reserved_tickets - $1
    WHERE event_id = $2
    `,
    [quantity, eventId]
  );

  releaseSuccess.inc();

  return {
    success: true
  };
}

module.exports = {
  getInventory,
  reserveTickets,
  releaseTickets
};