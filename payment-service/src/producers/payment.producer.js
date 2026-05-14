const { getChannel } = require('../rabbitmq/rabbitmq');

const publishEvent = async (routingKey, payload) => {

  const channel = getChannel();

  channel.publish(
    'soldout.events',
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    }
  );

  console.log(`Event published: ${routingKey}`);
};

module.exports = {
  publishEvent,
};