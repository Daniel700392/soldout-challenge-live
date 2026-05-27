const crypto = require('crypto')
const pool = require('../db/postgres')
const { publishPaymentEvent } = require('../producers/paymentProducer')

const processPayment = async (bookingId, amount) => {
  const success = Math.random() < 0.8

  const payment = {
    id: crypto.randomUUID(),
    bookingId,
    amount,
    status: success ? 'COMPLETED' : 'FAILED'
  }

  await pool.query(
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

  const routingKey = success ? 'payment.completed' : 'payment.failed'
  const outboxId = crypto.randomUUID()

  await pool.query(
    `
    INSERT INTO outbox_events (id, event_type, payload, published)
    VALUES ($1, $2, $3, $4)
    `,
    [outboxId, routingKey, payment, false]
  )

  let published = false
  try {
    published = await publishPaymentEvent(routingKey, payment)
  } catch (error) {
    console.error('Error publishing event:', error)
  }

  if (published) {
    await pool.query(
      `UPDATE outbox_events SET published = true WHERE id = $1`,
      [outboxId]
    )
  }

  return payment
}

module.exports = {
  processPayment
}