# Inventory Service

## Descripción

El `inventory-service` es el microservicio encargado de administrar el inventario de eventos y asientos dentro del sistema **SoldOut Challenge Live**.

Este servicio controla la disponibilidad de asientos y evita la sobreventa mediante validaciones de concurrencia.

## Responsabilidad dentro del sistema

Este servicio se encarga de:

* Consultar inventario de eventos.
* Gestionar disponibilidad de asientos.
* Reservar asientos temporalmente.
* Liberar asientos.
* Confirmar asientos vendidos.
* Evitar reservas duplicadas bajo concurrencia.
* Exponer métricas Prometheus.

## Puerto

* Local: `http://localhost:3002`
* Puerto interno Docker: `3002`

## Variables de entorno

Las variables de entorno se encuentran en `.env` y `.env.example`.

Variables principales:

| Variable      | Descripción         |
| ------------- | ------------------- |
| PORT          | Puerto del servicio |
| DATABASE_URL  | Conexión PostgreSQL |
| REDIS_URL     | Cache Redis         |
| POSTGRES_HOST | Host PostgreSQL     |

## Endpoints

### Health Check

```http id="j42ly4"
GET /health
```

Ejemplo:

```powershell id="n9kh5v"
Invoke-RestMethod -Uri "http://localhost:3002/health"
```

Respuesta esperada:

```json id="c2kr4v"
{
  "status": "ok",
  "service": "inventory-service"
}
```

---

### Metrics

```http id="p12ax0"
GET /metrics
```

Expone métricas Prometheus del servicio.

Ejemplo:

```powershell id="38g9hm"
Invoke-RestMethod -Uri "http://localhost:3002/metrics"
```

---

### Obtener Inventario de Evento

```http id="3m9a2k"
GET /inventory/:eventId
```

Ejemplo:

```http id="b2e7h0"
GET /inventory/99999999-9999-9999-9999-999999999999
```

Respuesta posible:

```json id="tfm82p"
{
  "available": 8,
  "reserved": 2
}
```

---

### Listar Eventos

```http id="vl9gr0"
GET /inventory/events
```

Retorna la lista de eventos disponibles.

---

### Obtener Asientos de Evento

```http id="n3y5w2"
GET /inventory/events/:eventId/seats
```

Permite consultar los asientos de un evento específico.

---

### Reservar Asiento

```http id="5u9mwl"
POST /inventory/seats/reserve
```

Ejemplo de request:

```json id="xn4p6v"
{
  "eventId": "99999999-9999-9999-9999-999999999999",
  "seatCode": "A5"
}
```

---

### Liberar Asiento

```http id="m5s2la"
POST /inventory/seats/release
```

Se utiliza cuando una reserva falla y el asiento debe liberarse.

---

### Confirmar Asiento

```http id="gr4qk7"
POST /inventory/seats/confirm
```

Marca el asiento como vendido/confirmado.

## Comunicación con otros servicios

El `inventory-service` se comunica principalmente con:

### Booking Service

Recibe solicitudes de reserva, confirmación y liberación de asientos.

### Redis

Utilizado como cache y apoyo para rendimiento.

### PostgreSQL

Persistencia principal de inventario y asientos.

## Ejecución con Docker Compose

Desde la raíz del proyecto:

```powershell id="t0a93s"
docker compose up -d inventory-service
```

Ver logs:

```powershell id="gv8j4m"
docker logs soldout-inventory-service --tail 50
```

## Validación rápida

```powershell id="d4u0k7"
Invoke-RestMethod -Uri "http://localhost:3002/health"
```

Si responde `status: ok`, el servicio está funcionando correctamente.
