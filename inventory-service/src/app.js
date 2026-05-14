require('dotenv').config();

const express = require('express');
const client = require('prom-client');

const inventoryRoutes = require('./routes/inventory.routes');

const app = express();

app.use(express.json());

client.collectDefaultMetrics();

app.get('/health', (req, res) => {

  res.json({
    status: 'ok',
    service: 'inventory-service'
  });
});

app.get('/metrics', async (req, res) => {

  res.set('Content-Type', client.register.contentType);

  res.end(await client.register.metrics());
});

app.use('/inventory', inventoryRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {

  console.log(`Inventory service running on port ${PORT}`);
});