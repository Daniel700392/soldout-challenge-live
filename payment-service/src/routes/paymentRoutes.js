const express = require('express');

const router = express.Router();

const { processPayment } = require('../services/paymentService');

router.post('/process', async (req, res) => {

  const { bookingId, amount } = req.body;

  const payment = await processPayment(bookingId, amount);

  res.json(payment);
});

module.exports = router;