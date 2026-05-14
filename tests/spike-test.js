import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '20s', target: 20 },
    { duration: '20s', target: 100 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.30'],
    http_req_duration: ['p(95)<3000']
  }
}

export default function () {
  const res = http.get('http://host.docker.internal:3010/health')

  check(res, {
    'status is 200': (r) => r.status === 200
  })

  sleep(0.2)
}