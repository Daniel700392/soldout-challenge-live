import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 5,
};

export default function () {
  const payload = JSON.stringify({
    eventId: "11111111-1111-1111-1111-111111111111",
    userId: "22222222-2222-2222-2222-222222222222",
    quantity: 1,
    requestId: crypto.randomUUID(),
    amount: 150
  });

  const res = http.post('http://host.docker.internal:3004/bookings', payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: '10s',
  });

  console.log(`status=${res.status} body=${res.body}`);

  check(res, {
    'response received': (r) => r.status > 0,
  });

  sleep(0.2);
}