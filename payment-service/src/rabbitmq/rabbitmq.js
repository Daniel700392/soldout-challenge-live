const amqp = require('amqplib');

let connection;
let channel;
let reconnecting = false;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@soldout-rabbitmq:5672';

const setupRabbitMQ = async () => {
  channel = await connection.createChannel();

  channel.on('error', (error) => {
    console.error('RabbitMQ channel error:', error.message);
    channel = null;
  });

  channel.on('close', () => {
    console.error('RabbitMQ channel closed');
    channel = null;
  });

  await channel.assertExchange('soldout.events', 'topic', { durable: true });

  await channel.assertExchange('soldout.dlx', 'topic', { durable: true });

  await channel.assertQueue('dead.letter.queue', { durable: true });

  await channel.bindQueue('dead.letter.queue', 'soldout.dlx', '#');

  await channel.assertQueue('payment.events.queue', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'soldout.dlx',
    },
  });

  await channel.assertQueue('notification.queue', { durable: true });

  console.log('RabbitMQ connected');
};

const scheduleReconnect = () => {
  if (reconnecting) return;

  reconnecting = true;
  channel = null;
  connection = null;

  console.log('RabbitMQ reconnect scheduled in 5 seconds...');

  setTimeout(async () => {
    reconnecting = false;
    await connectRabbitMQ();
  }, 5000);
};

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);

    connection.on('error', (error) => {
      console.error('RabbitMQ connection error:', error.message);
    });

    connection.on('close', () => {
      console.error('RabbitMQ connection closed');
      scheduleReconnect();
    });

    await setupRabbitMQ();
  } catch (error) {
    console.error('RabbitMQ connection failed:', error.message);
    scheduleReconnect();
  }
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  getChannel,
};