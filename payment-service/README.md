# Payment Service

## Descripción

El `payment-service` es el microservicio encargado de procesar pagos dentro del sistema **SoldOut Challenge Live**.

Su función principal es validar y registrar pagos asociados a reservas de boletos, además de emitir eventos para continuar el flujo de la arquitectura basada en microservicios.

## Responsabilidad dentro del sistema

Este servicio se encarga de:

* Procesar pagos de reservas.
* Registrar pagos en PostgreSQL.
* Comunicar eventos mediante RabbitMQ.
* Participar en el flujo de Saga Pattern.
* Exponer métricas Prometheus.
* Proveer monitoreo y health checks.

## Puerto

* Local: `http://localhost:3003`
* Puerto interno Docker: `3003`

## Variables de entorno

Las variables se encuentran en `.env` y `.env.example`.

Variables principales:

| Variable      | Descripción         |
| ------------- | ------------------- |
| PORT          | Puerto del servicio |
| DATABASE_URL  | Conexión PostgreSQL |
| RABBITMQ_URL  | URL de RabbitMQ     |
| POSTGRES_HOST | Host PostgreSQL     |

## Endpoints

### Health Check

```http id="pc8v4l"
GET /health
```

Ejemplo:

```powershell id="sd1u5k"
Invoke-RestMethod -Uri "http://localhost:3003/health"
```

Respuesta esperada:

```json id="be4j1t"
{
  "status": "UP",
  "service": "payment-service"
}
```

---

### Metrics

```http id="zt3h7a"
GET /metrics
```

Expone métricas Prometheus del servicio.

Ejemplo:

```powershell id="nh6w2q"
Invoke-RestMethod -Uri "http://localhost:3003/metrics"
```

---

### Procesar Pago

```http id="o7l2pr"
POST /process
```

Ejemplo de request:

```json id="r8j4yv"
{
  "bookingId": "11111111-1111-1111-1111-111111111111",
  "amount": 150
}
```

Ejemplo de respuesta:

```json id="g4u8km"
{
  "success": true,
  "amount": 150
}
```

## Comunicación con otros servicios

El `payment-service` se comunica con:

### Booking Service

Recibe solicitudes de pago provenientes del proceso de reserva.

### RabbitMQ

Publica eventos relacionados con pagos procesados.

### PostgreSQL

Almacena la persistencia de pagos.

## Ejecución con Docker Compose

Desde la raíz del proyecto:

```powershell id="j2o8pw"
docker compose up -d payment-service
```

Ver logs:

```powershell id="d9q4mt"
docker logs soldout-payment-service --tail 50
```

## Validación rápida

```powershell id="m7v1ce"
Invoke-RestMethod -Uri "http://localhost:3003/health"
```

Si responde `status: UP`, el servicio está funcionando correctamente.
