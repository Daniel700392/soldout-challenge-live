const amqp = require('amqplib')

let channel

let connection

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL)

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error', err)
      channel = null
      setTimeout(connectRabbitMQ, 5000)
    })

    connection.on('close', () => {
      console.error('RabbitMQ connection closed')
      channel = null
      setTimeout(connectRabbitMQ, 5000)
    })

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
  } catch (error) {
    console.error('Failed to connect to RabbitMQ, retrying in 5 seconds...', error.message)
    setTimeout(connectRabbitMQ, 5000)
  }
}

const getChannel = () => channel

module.exports = {
  connectRabbitMQ,
  getChannel
}