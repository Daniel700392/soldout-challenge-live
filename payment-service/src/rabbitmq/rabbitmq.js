const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async () => {

  const connection = await amqp.connect(
    process.env.RABBITMQ_URL
  );

  channel = await connection.createChannel();

  await channel.assertExchange(
    'soldout.events',
    'topic',
    {
      durable: true,
    }
  );

  await channel.assertQueue(
    'payment.events.queue',
    {
      durable: true,
    }
  );

  await channel.assertQueue(
    'notification.queue',
    {
      durable: true,
    }
  );

  await channel.assertQueue(
    'dead.letter.queue',
    {
      durable: true,
    }
  );

  console.log('RabbitMQ connected');
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  getChannel,
};