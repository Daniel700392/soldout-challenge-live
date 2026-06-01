require('dotenv').config();

const express = require('express');
const promClient = require('prom-client');
const inventoryRoutes = require('./routes/inventory.routes');
const { connectRedis } = require('./redis/redisClient');

const app = express();

app.use(express.json());

promClient.collectDefaultMetrics();

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP recibidos',
  labelNames: ['service', 'method', 'route', 'status_code']
});

const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de requests HTTP en segundos',
  labelNames: ['service', 'method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 3, 5]
});

app.use((req, res, next) => {
  if (req.path === '/metrics') {
    return next();
  }

  const end = httpRequestDurationSeconds.startTimer();

  res.on('finish', () => {
    const route = req.route && req.route.path ? req.route.path : req.path;

    httpRequestsTotal.inc({
      service: 'inventory-service',
      method: req.method,
      route,
      status_code: String(res.statusCode)
    });

    end({
      service: 'inventory-service',
      method: req.method,
      route,
      status_code: String(res.statusCode)
    });
  });

  next();
});

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