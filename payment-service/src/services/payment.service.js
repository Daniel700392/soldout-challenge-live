const { v4: uuidv4 } = require('uuid');

const pool = require('../db/postgres');

const { publishEvent } = require('../producers/payment.producer');

const processPayment = async (bookingId, amount) => {
  const success = Math.random() < 0.8;

  const payment = {
    id: uuidv4(),
    booking_id: bookingId,
    amount,
    status: success ? 'COMPLETED' : 'FAILED',
  };

  await pool.query(
    `
    INSERT INTO payments
    (id, booking_id, amount, status)
    VALUES ($1, $2, $3, $4)
    `,
    [
      payment.id,
      payment.booking_id,
      payment.amount,
      payment.status,
    ]
  );

  const eventType =
    success
      ? 'payment.completed'
      : 'payment.failed';

  const outboxId = uuidv4();

  await pool.query(
    `
    INSERT INTO outbox_events
    (id, event_type, payload, published)
    VALUES ($1, $2, $3, false)
    `,
    [
      outboxId,
      eventType,
      JSON.stringify(payment),
    ]
  );

  try {
    const published = await publishEvent(eventType, payment);

    if (published) {
      await pool.query(
        `
        UPDATE outbox_events
        SET published = true
        WHERE id = $1
        `,
        [outboxId]
      );
    }
  } catch (publishError) {
    console.error(
      'Payment event publish failed. Leaving event in outbox:',
      publishError.message
    );
  }

  return payment;
};

module.exports = {
  processPayment,
};