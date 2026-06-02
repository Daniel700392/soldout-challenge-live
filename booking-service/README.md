# Booking Service

## Descripción

El `booking-service` es el microservicio encargado de gestionar las reservas de boletos dentro del sistema **SoldOut Challenge Live**.

Su función principal es orquestar el proceso de reserva utilizando una arquitectura basada en **Saga Pattern**, garantizando:

* No sobreventa de asientos.
* No duplicación de reservas.
* Persistencia correcta de pagos.
* Coordinación con Inventory Service y Payment Service.

## Responsabilidad dentro del sistema

Este servicio se encarga de:

* Crear reservas de boletos.
* Reservar asientos específicos.
* Validar idempotencia mediante `requestId`.
* Coordinar el flujo entre inventario y pagos.
* Confirmar reservas exitosas.
* Exponer métricas para observabilidad.

## Puerto

* Local: `http://localhost:3004`
* Puerto interno Docker: `3004`

## Variables de entorno

Las variables de entorno se encuentran en `.env` y `.env.example`.

Variables principales:

| Variable              | Descripción               |
| --------------------- | ------------------------- |
| PORT                  | Puerto del servicio       |
| DATABASE_URL          | Conexión PostgreSQL       |
| INVENTORY_SERVICE_URL | URL del inventory-service |
| PAYMENT_SERVICE_URL   | URL del payment-service   |

## Endpoints

### Health Check

```http
GET /health
```

Ejemplo:

```powershell
Invoke-RestMethod -Uri "http://localhost:3004/health"
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "booking-service"
}
```

---

### Metrics

```http
GET /metrics
```

Expone métricas Prometheus del servicio.

Ejemplo:

```powershell
Invoke-RestMethod -Uri "http://localhost:3004/metrics"
```

---

### Crear Reserva Tradicional

```http
POST /bookings
```

Ejemplo de request:

```json
{
  "eventId": "99999999-9999-9999-9999-999999999999",
  "userId": "11111111-1111-1111-1111-111111111111",
  "quantity": 1,
  "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
  "amount": 150
}
```

---

### Reservar Asiento Específico

```http
POST /bookings/seat
```

Ejemplo de request:

```json
{
  "eventId": "99999999-9999-9999-9999-999999999999",
  "userId": "11111111-1111-1111-1111-111111111111",
  "seatCode": "A5",
  "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5",
  "amount": 150
}
```

Ejemplo de respuesta exitosa:

```json
{
  "status": "CONFIRMED",
  "seat_code": "A5",
  "amount": 150
}
```

Ejemplo de respuesta cuando el asiento ya fue tomado:

```json
{
  "error": "El asiento ya no está disponible",
  "status": "REJECTED"
}
```

## Comunicación con otros servicios

El `booking-service` se comunica con:

### Inventory Service

Responsable de reservar, liberar y confirmar asientos.

### Payment Service

Responsable de procesar pagos de las reservas.

## Ejecución con Docker Compose

Desde la raíz del proyecto:

```powershell
docker compose up -d booking-service
```

Ver logs:

```powershell
docker logs soldout-booking-service --tail 50
```

## Validación rápida

```powershell
Invoke-RestMethod -Uri "http://localhost:3004/health"
```

Si responde `status: ok`, el servicio está funcionando correctamente.
