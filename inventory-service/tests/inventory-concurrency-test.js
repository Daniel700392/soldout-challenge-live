const axios = require('axios');

const TOTAL_REQUESTS = 20;

async function runTest() {

  const requests = [];

  for (let i = 0; i < TOTAL_REQUESTS; i++) {

    requests.push(

      axios.post(
        'http://localhost:3002/inventory/reserve',
        {
          eventId: '11111111-1111-1111-1111-111111111111',
          quantity: 1,
          requestId: crypto.randomUUID()
        }
      )
      .then(() => {

        console.log(`SUCCESS ${i}`);

      })
      .catch((err) => {

        console.log(`FAILED ${i}:`, err.response?.data || err.message);

      })
    );
  }

  await Promise.all(requests);

  console.log('TEST FINISHED');
}

runTest();