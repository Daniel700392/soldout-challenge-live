require('dotenv').config()

const express = require('express')
const promClient = require('prom-client')

const inventoryRoutes = require('./routes/inventory.routes')

const app = express()

app.use(express.json())

promClient.collectDefaultMetrics()

app.use('/inventory', inventoryRoutes)

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType)

  res.end(await promClient.register.metrics())
})

app.get('/', (req, res) => {
  res.send('Inventory Service Running')
})

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'inventory-service'
  })
})

app.listen(process.env.PORT, () => {
  console.log(`Inventory service running on port ${process.env.PORT}`)
})