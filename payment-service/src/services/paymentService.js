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

  if (success) {
    await publishPaymentEvent('payment.completed', payment)
  } else {
    await publishPaymentEvent('payment.failed', payment)
  }

  return payment
}

module.exports = {
  processPayment
}