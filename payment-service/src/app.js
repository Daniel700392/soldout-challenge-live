require('dotenv').config()

const express = require('express')
const paymentRoutes = require('./routes/paymentRoutes')
const { connectRabbitMQ } = require('./config/rabbitmq')
const { register } = require('./metrics/metrics')

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Payment service running')
})

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'payment-service'
  })
})

app.use('/payments', paymentRoutes)

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

const PORT = process.env.PORT || 3003

const startServer = async () => {
  try {
    await connectRabbitMQ()

    app.listen(PORT, () => {
      console.log(`Payment service running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer()