# Resilience Testing Report — Sold-Out Challenge Live

## Objetivo

Validar que la plataforma distribuida mantiene disponibilidad parcial y capacidad de recuperación ante fallos controlados.

## Prueba 1 — Detener payment-service en Docker

### Comando ejecutado

```powershell
docker stop soldout-payment-service