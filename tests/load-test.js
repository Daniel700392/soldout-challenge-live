import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50,
  iterations: 50000,
  thresholds: {
    http_req_failed: ['rate<0.20'],
    http_req_duration: ['p(95)<2000']
  }
}

export default function () {
  const res = http.get('http://host.docker.internal:3010/health')

  check(res, {
    'status is 200': (r) => r.status === 200
  })

  sleep(0.1)
}