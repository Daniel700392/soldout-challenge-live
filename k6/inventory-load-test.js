import http from 'k6/http'

export const options = {
  vus: 20,
  duration: '20s',
}

export default function () {
  http.get('http://localhost:3002/health')
}