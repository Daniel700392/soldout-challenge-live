const { getChannel } = require('../config/rabbitmq');

const publishPaymentEvent = async (routingKey, message) => {

  const channel = getChannel();

  channel.publish(
    'soldout.events',
    routingKey,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
    }
  );

  console.log(`Event published: ${routingKey}`);
};

module.exports = {
  publishPaymentEvent,
};