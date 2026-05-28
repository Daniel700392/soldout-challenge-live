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

 await channel.assertExchange('soldout.dlx', 'topic', {
  durable: true
  })

  await channel.assertQueue('dead.letter.queue', {
  durable: true
  })

  await channel.bindQueue('dead.letter.queue', 'soldout.dlx', '#')

  await channel.assertQueue('payment.events.queue', {
    durable: true,
     arguments: {
    'x-dead-letter-exchange': 'soldout.dlx'
    }
  })

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