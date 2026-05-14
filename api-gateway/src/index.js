const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()

const PORT = process.env.PORT || 3000

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3004'
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002'
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3003'

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-gateway'
  })
})

app.get('/', (req, res) => {
  res.send('API Gateway Running')
})

app.use('/bookings', createProxyMiddleware({
  target: BOOKING_SERVICE_URL,
  changeOrigin: true
}))

app.use('/inventory', createProxyMiddleware({
  target: INVENTORY_SERVICE_URL,
  changeOrigin: true
}))

app.use('/payments', createProxyMiddleware({
  target: PAYMENT_SERVICE_URL,
  changeOrigin: true
}))

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
})