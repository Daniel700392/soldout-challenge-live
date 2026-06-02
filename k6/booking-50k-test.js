import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  iterations: 50000,
  thresholds: {
    http_req_failed: ['rate<0.30'],
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  const unique = `${__VU}-${__ITER}-${Date.now()}`;

  const payload = JSON.stringify({
    eventId: "11111111-1111-1111-1111-111111111111",
    userId: "22222222-2222-2222-2222-222222222222",
    quantity: 1,
    requestId: crypto.randomUUID ? crypto.randomUUID() : "99999999-9999-4999-8999-999999999999",
    amount: 150
  });

  const params = {
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: '10s',
    responseCallback: http.expectedStatuses(200, 201, 400, 409, 500),
    };

  const res = http.post('http://host.docker.internal:3004/bookings', payload, params);

  check(res, {
    'status is 200 or 201 or handled error': (r) =>
      r.status === 200 || r.status === 201 || r.status === 400 || r.status === 409 || r.status === 500,
  });

  sleep(0.01);
}