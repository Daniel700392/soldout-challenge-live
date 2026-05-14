require('dotenv').config()

const express = require('express')
const amqp = require('amqplib')
const promClient = require('prom-client')

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3005
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'

const exchangeName = 'soldout.events'
const queueName = 'notification.queue'

const notificationsConsumed = new promClient.Counter({
  name: 'notifications_consumed_total',
  help: 'Total number of notification events consumed'
})

const notificationsFailed = new promClient.Counter({
  name: 'notifications_failed_total',
  help: 'Total number of notification events failed'
})

promClient.collectDefaultMetrics()

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'notification-service'
  })
})

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType)
  res.end(await promClient.register.metrics())
})

app.get('/', (req, res) => {
  res.send('Notification Service Running')
})

const startConsumer = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL)
    const channel = await connection.createChannel()

    await channel.assertExchange(exchangeName, 'topic', {
      durable: true
    })

    await channel.assertQueue(queueName, {
      durable: true
    })

    await channel.bindQueue(queueName, exchangeName, 'payment.completed')
    await channel.bindQueue(queueName, exchangeName, 'payment.failed')
    await channel.bindQueue(queueName, exchangeName, 'booking.created')
    await channel.bindQueue(queueName, exchangeName, 'notification.send')

    console.log('Notification Service connected to RabbitMQ')
    console.log(`Waiting for events in queue: ${queueName}`)

    channel.consume(queueName, async (message) => {
      if (!message) return

      try {
        const event = JSON.parse(message.content.toString())

        console.log('[Notification] Event received:', {
          routingKey: message.fields.routingKey,
          payload: event
        })

        notificationsConsumed.inc()

        channel.ack(message)
      } catch (error) {
        console.error('[Notification] Error processing event:', error.message)
        notificationsFailed.inc()
        channel.nack(message, false, false)
      }
    })
  } catch (error) {
    console.error('RabbitMQ connection failed:', error.message)

    setTimeout(() => {
      startConsumer()
    }, 5000)
  }
}

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`)
  startConsumer()
})