const amqp = require('amqplib')

let channel

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL)

  channel = await connection.createChannel()

  await channel.assertExchange('soldout.events', 'topic', {
    durable: true
  })

  await channel.assertQueue('payment.events.queue', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'soldout.dlx'
    }
  })

  await channel.assertExchange('soldout.dlx', 'topic', {
    durable: true
  })

  await channel.bindQueue(
    'payment.events.queue',
    'soldout.events',
    'payment.*'
  )

  console.log('RabbitMQ connected')
}

const getChannel = () => channel

module.exports = {
  connectRabbitMQ,
  getChannel
}