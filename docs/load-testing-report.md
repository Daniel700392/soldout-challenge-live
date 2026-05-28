# Load Testing Report — Inventory Service

## Herramienta

Grafana k6

## Escenario

Se ejecutó una prueba de carga contra el endpoint `/health` del inventory-service.

## Configuración

- Usuarios virtuales: 20 VUs
- Duración: 20 segundos
- Endpoint: `http://localhost:3002/health`

## Resultados

- Requests totales: 84,308
- Requests fallidas: 0
- Tasa de error: 0.00%
- Throughput aproximado: 4,214 requests/segundo
- Latencia promedio: 4.69 ms
- Latencia p95: 8.04 ms
- Latencia máxima: 120.08 ms

## Conclusión

El inventory-service respondió exitosamente bajo carga sostenida, sin errores HTTP y con baja latencia. Esto demuestra estabilidad del servicio bajo concurrencia controlada.