const express = require('express')
const router = express.Router()

const { processPayment } = require('../services/paymentService')

router.post('/process', async (req, res) => {
  try {
    const { bookingId, amount } = req.body

    if (!bookingId || !amount) {
      return res.status(400).json({
        error: 'bookingId and amount are required'
      })
    }

    const payment = await processPayment(bookingId, amount)

    res.status(200).json(payment)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
})

module.exports = router