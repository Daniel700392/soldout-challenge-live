const express = require('express');
const promClient = require('prom-client');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = process.env.PORT || 3000;

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3004';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3003';

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
      service: 'api-gateway',
      method: req.method,
      route,
      status_code: String(res.statusCode)
    });

    end({
      service: 'api-gateway',
      method: req.method,
      route,
      status_code: String(res.statusCode)
    });
  });

  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-gateway'
  });
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/', (req, res) => {
  res.send('API Gateway Running');
});

app.use('/bookings', createProxyMiddleware({
  target: BOOKING_SERVICE_URL,
  changeOrigin: true
}));

app.use('/inventory', createProxyMiddleware({
  target: INVENTORY_SERVICE_URL,
  changeOrigin: true
}));

app.use('/payments', createProxyMiddleware({
  target: PAYMENT_SERVICE_URL,
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});