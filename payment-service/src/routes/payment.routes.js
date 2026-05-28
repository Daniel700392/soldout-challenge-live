const express = require('express');

const router = express.Router();

const {
  processPayment,
} = require('../services/payment.service');

router.post('/process', async (req, res) => {

  try {

    const { bookingId, amount } = req.body;

    const payment = await processPayment(
      bookingId,
      amount
    );

    res.json(payment);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Payment failed',
    });
  }
});

module.exports = router;