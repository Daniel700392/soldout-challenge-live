const pool = require('../db/postgres')
const redisClient = require('../redis/redisClient')

const reserve = async (eventId, quantity = 1) => {
  const lockKey = `lock:event:${eventId}`
  const lock = await redisClient.set(lockKey, 'locked', {
    NX: true,
    EX: 5
  })

  if (!lock) {
    throw new Error('Resource busy')
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `
      SELECT available_tickets
      FROM inventory
      WHERE event_id = $1
      FOR UPDATE
      `,
      [eventId]
    )

    if (result.rows.length === 0) {
      throw new Error('Event not found')
    }

    const available = result.rows[0].available_tickets

    if (available < quantity) {
      throw new Error('Not enough tickets available')
    }

    await client.query(
      `
      UPDATE inventory
      SET
        available_tickets = available_tickets - $2,
        reserved_tickets = reserved_tickets + $2
      WHERE event_id = $1
      `,
      [eventId, quantity]
    )

    await client.query('COMMIT')

    return {
      success: true,
      eventId,
      quantity,
      message: 'Tickets reserved successfully'
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await redisClient.del(lockKey)
  }
}

const release = async (eventId, quantity = 1) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `
      SELECT reserved_tickets
      FROM inventory
      WHERE event_id = $1
      FOR UPDATE
      `,
      [eventId]
    )

    if (result.rows.length === 0) {
      throw new Error('Event not found')
    }

    const reserved = result.rows[0].reserved_tickets

    if (reserved < quantity) {
      throw new Error('Not enough reserved tickets to release')
    }

    await client.query(
      `
      UPDATE inventory
      SET
        available_tickets = available_tickets + $2,
        reserved_tickets = reserved_tickets - $2
      WHERE event_id = $1
      `,
      [eventId, quantity]
    )

    await client.query('COMMIT')

    return {
      success: true,
      eventId,
      quantity,
      message: 'Tickets released successfully'
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const getByEventId = async (eventId) => {
  const result = await pool.query(
    `
    SELECT id, event_id, available_tickets, reserved_tickets
    FROM inventory
    WHERE event_id = $1
    `,
    [eventId]
  )

  if (result.rows.length === 0) {
    throw new Error('Event not found')
  }

  return result.rows[0]
}

module.exports = {
  reserve,
  release,
  getByEventId
}