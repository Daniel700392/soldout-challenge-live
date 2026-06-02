# Notification Service

## Descripción

El `notification-service` es el microservicio encargado de consumir eventos internos del sistema **SoldOut Challenge Live**.

Este servicio escucha eventos provenientes de RabbitMQ para procesar acciones relacionadas con notificaciones del sistema.

Actualmente participa como consumidor de eventos dentro de la arquitectura basada en microservicios.

## Responsabilidad dentro del sistema

Este servicio se encarga de:

* Consumir eventos desde RabbitMQ.
* Procesar mensajes internos del sistema.
* Participar en flujos asíncronos.
* Exponer métricas Prometheus.
* Proveer health checks.

## Puerto

* Local: `http://localhost:3005`
* Puerto interno Docker: `3005`

## Variables de entorno

Las variables se encuentran en `.env` y `.env.example`.

Variables principales:

| Variable     | Descripción         |
| ------------ | ------------------- |
| PORT         | Puerto del servicio |
| RABBITMQ_URL | URL de RabbitMQ     |

## Endpoints

### Health Check

```http
GET /health
```

Ejemplo:

```powershell
Invoke-RestMethod -Uri "http://localhost:3005/health"
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "notification-service"
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
Invoke-RestMethod -Uri "http://localhost:3005/metrics"
```

## Comunicación con otros servicios

El `notification-service` se comunica con:

### RabbitMQ

Consume eventos emitidos por otros microservicios.

### Booking Service

Puede reaccionar a eventos relacionados con reservas.

### Payment Service

Puede consumir eventos relacionados con pagos procesados.

## Ejecución con Docker Compose

Desde la raíz del proyecto:

```powershell
docker compose up -d notification-service
```

Ver logs:

```powershell
docker logs soldout-notification-service --tail 50
```

## Validación rápida

```powershell
Invoke-RestMethod -Uri "http://localhost:3005/health"
```

Si responde `status: ok`, el servicio está funcionando correctamente.
