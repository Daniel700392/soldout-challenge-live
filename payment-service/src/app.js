require('dotenv').config();

const express = require('express');

const paymentRoutes = require('./routes/payment.routes');

const {
  connectRabbitMQ,
} = require('./rabbitmq/rabbitmq');

const {
  register,
  collectDefaultMetrics,
} = require('prom-client');

collectDefaultMetrics();

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {

  res.json({
    status: 'UP',
  });
});

app.use('/payments', paymentRoutes);

app.get('/metrics', async (req, res) => {

  res.set(
    'Content-Type',
    register.contentType
  );

  res.end(
    await register.metrics()
  );
});

const PORT = process.env.PORT || 3003;

const startServer = async () => {

  try {

    try {

      await connectRabbitMQ();

    } catch (error) {

      console.error(
        'RabbitMQ connection failed:',
        error.message
      );
    }

    app.listen(PORT, () => {

      console.log(
        `Payment service running on port ${PORT}`
      );
    });

  } catch (error) {

    console.error(
      'Error starting server:',
      error
    );
  }
};

startServer();