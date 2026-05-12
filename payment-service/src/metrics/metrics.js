const client = require('prom-client');

client.collectDefaultMetrics();

const register = client.register;

module.exports = {
  register,
};