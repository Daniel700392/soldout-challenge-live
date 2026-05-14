const redis = require('redis');

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

client.on('error', (err) => {
  console.error('Redis Error:', err.message);
});

let connected = false;

async function connectRedis() {
  if (!connected) {
    await client.connect();
    connected = true;
    console.log('Redis connected');
  }
}

module.exports = {
  client,
  connectRedis,
};
