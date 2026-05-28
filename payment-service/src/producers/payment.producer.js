const { getChannel } = require('../rabbitmq/rabbitmq');

const publishEvent = async (routingKey, payload) => {
  const channel = getChannel();

  if (!channel) {
    console.error('RabbitMQ channel is not available. Skipping publish.');
    return false;
  }

  try {
    channel.publish(
      'soldout.events',
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,
      }
    );

    console.log(`Event published: ${routingKey}`);
    return true;
  } catch (error) {
    console.error('RabbitMQ publish failed:', error.message);
    return false;
  }
};

module.exports = {
  publishEvent,
};