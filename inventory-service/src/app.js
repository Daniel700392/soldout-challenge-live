require('dotenv').config()

const express = require('express')
const promClient = require('prom-client')

const app = express()

app.use(express.json())

promClient.collectDefaultMetrics()

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType)
  res.end(await promClient.register.metrics())
})

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: process.env.SERVICE_NAME || 'inventory-service'
  })
})

app.get('/', (req, res) => {
  res.send('Inventory Service Running')
})

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Inventory service running on port ${PORT}`)
})