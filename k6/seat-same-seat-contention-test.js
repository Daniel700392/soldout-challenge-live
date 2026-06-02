import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  iterations: 1000,
  thresholds: {
    http_req_failed: ['rate<0.10'], // we expect most requests to fail due to contention
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  // Generate a unique requestId for each VU/iteration
  const requestId = crypto.randomUUID();

  const payload = JSON.stringify({
    eventId: '99999999-9999-9999-9999-999999999999',
    userId: '11111111-1111-1111-1111-111111111111',
    seatCode: 'B2',
    requestId: requestId,
    amount: 150,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    timeout: '10s',
    // Accept normal success codes and the expected contention errors
    responseCallback: http.expectedStatuses(200, 201, 400, 409),
  };

  const res = http.post('http://host.docker.internal:3004/bookings/seat', payload, params);

  // Validate that we receive either a success or an intended rejection
  check(res, {
    'status is 200/201 or handled error': (r) =>
      r.status === 200 || r.status === 201 || r.status === 400 || r.status === 409,
  });

  // Small pause to let other VUs contend for the same seat
  sleep(0.01);
}
