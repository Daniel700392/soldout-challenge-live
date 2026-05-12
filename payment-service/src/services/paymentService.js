const { v4: uuidv4 } = require('uuid');

const { publishPaymentEvent } = require('../producers/paymentProducer');

const processPayment = async (bookingId, amount) => {

  const success = Math.random() < 0.8;

  const payment = {
    id: uuidv4(),
    bookingId,
    amount,
    status: success ? 'SUCCESS' : 'FAILED',
  };

  if (success) {

    await publishPaymentEvent(
      'payment.completed',
      payment
    );

  } else {

    await publishPaymentEvent(
      'payment.failed',
      payment
    );
  }

  return payment;
};

module.exports = {
  processPayment,
};