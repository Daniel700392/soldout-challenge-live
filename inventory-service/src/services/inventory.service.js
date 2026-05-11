const pool = require('../db/postgres')
const redisClient = require('../redis/redisClient')

const reserve = async (eventId) => {

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

    if (available <= 0) {
      throw new Error('Sold out')
    }

    await client.query(
      `
      UPDATE inventory
      SET
        available_tickets = available_tickets - 1,
        reserved_tickets = reserved_tickets + 1
      WHERE event_id = $1
      `,
      [eventId]
    )

    await client.query('COMMIT')

    return {
      success: true
    }

  } catch (error) {

    await client.query('ROLLBACK')

    throw error

  } finally {

    client.release()

    await redisClient.del(lockKey)

  }

}

module.exports = {
  reserve
}