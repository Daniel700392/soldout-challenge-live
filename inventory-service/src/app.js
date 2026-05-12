<<<<<<< HEAD
const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

// health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: process.env.SERVICE_NAME
  });
});

// endpoint booking
app.post("/booking", (req, res) => {
  res.json({ message: "booking created" });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});
=======
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
>>>>>>> b48d1e9f1b01c62f6606ae1ff3de30df77b0d130
