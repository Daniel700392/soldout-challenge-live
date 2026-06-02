import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomSeed } from 'k6';

randomSeed(Date.now());

export const options = {
  vus: 100,
  iterations: 1000,
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
  },
};

const BASE_URL = 'http://host.docker.internal:3004';
const EVENT_ID = '99999999-9999-9999-9999-999999999999';
const USER_ID = '22222222-2222-2222-2222-222222222222';

const seats = [];

for (const row of ['C', 'D', 'E', 'F', 'G', 'H', 'I']) {
  for (let n = 1; n <= 15; n++) {
    seats.push(`${row}${n}`);
  }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function () {
  const seatCode = seats[Math.floor(Math.random() * seats.length)];

  const payload = JSON.stringify({
    userId: USER_ID,
    eventId: EVENT_ID,
    seatCode,
    requestId: uuidv4(),
    amount: 150,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    responseCallback: http.expectedStatuses(200, 201, 400, 409),
  };

  const res = http.post(`${BASE_URL}/bookings/seat`, payload, params);

  check(res, {
    'status is acceptable': (r) =>
      r.status === 200 ||
      r.status === 201 ||
      r.status === 400 ||
      r.status === 409,
  });

  sleep(0.1);
}