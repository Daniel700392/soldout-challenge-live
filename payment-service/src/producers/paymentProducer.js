const { getChannel } = require('../config/rabbitmq');

const publishPaymentEvent = async (routingKey, message) => {

  const channel = getChannel();

  if (!channel) {
    console.error('RabbitMQ channel not available');
    return false;
  }

  try {
    channel.publish(
      'soldout.events',
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      }
    );

    console.log(`Event published: ${routingKey}`);
    return true;
  } catch (error) {
    console.error('Failed to publish event:', error);
    return false;
  }
};

module.exports = {
  publishPaymentEvent,
};