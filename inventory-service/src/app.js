require('dotenv').config();

const express = require('express');
const promClient = require('prom-client');
const inventoryRoutes = require('./routes/inventory.routes');
const { connectRedis } = require('./redis/redisClient');

const app = express();

app.use(express.json());

promClient.collectDefaultMetrics();

app.get('/health', (req, res) => {

  res.json({
    status: 'ok',
    service: 'inventory-service',
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/', (req, res) => {
  res.send('Inventory Service Running');
});

app.use('/inventory', inventoryRoutes);

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Inventory service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start inventory-service:', error.message);
    process.exit(1);
  }
}

startServer();
