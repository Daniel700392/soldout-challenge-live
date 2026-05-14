const crypto = require('crypto')
const pool = require('../db/postgres')
const { publishPaymentEvent } = require('../producers/paymentProducer')

const processPayment = async (bookingId, amount) => {
  const client = await pool.connect()
  const success = Math.random() < 0.8

  const payment = {
    id: crypto.randomUUID(),
    bookingId,
    amount,
    status: success ? 'COMPLETED' : 'FAILED'
  }

  const eventType = success ? 'payment.completed' : 'payment.failed'
  const outboxId = crypto.randomUUID()

  try {
    await client.query('BEGIN')

    await client.query(
      `
      INSERT INTO payments (id, booking_id, amount, status)
      VALUES ($1, $2, $3, $4)
      `,
      [
        payment.id,
        payment.bookingId,
        payment.amount,
        payment.status
      ]
    )

    await client.query(
      `
      INSERT INTO outbox_events (id, event_type, payload, published)
      VALUES ($1, $2, $3, false)
      `,
      [
        outboxId,
        eventType,
        JSON.stringify(payment)
      ]
    )

    await client.query('COMMIT')

    try {
      await publishPaymentEvent(eventType, payment)

      await pool.query(
        `
        UPDATE outbox_events
        SET published = true
        WHERE id = $1
        `,
        [outboxId]
      )
    } catch (publishError) {
      console.error('Payment event publish failed:', publishError.message)
    }

    return payment
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  processPayment
}