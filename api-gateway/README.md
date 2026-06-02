# API Gateway

## Descripción

El `api-gateway` es el punto de entrada principal del sistema **SoldOut Challenge Live**. Su responsabilidad es recibir solicitudes HTTP externas y redirigirlas hacia los microservicios internos correspondientes.

## Responsabilidad dentro del sistema

* Centralizar el acceso a los microservicios.
* Exponer un único punto de entrada HTTP.
* Redirigir peticiones hacia servicios internos.
* Exponer métricas para Prometheus.
* Proveer un endpoint de salud del sistema.

## Puerto

* Local: `http://localhost:3000`
* Puerto interno Docker: `3000`

## Variables de entorno

| Variable              | Descripción                         |
| --------------------- | ----------------------------------- |
| PORT                  | Puerto donde escucha el API Gateway |
| BOOKING_SERVICE_URL   | URL interna del booking-service     |
| INVENTORY_SERVICE_URL | URL interna del inventory-service   |
| PAYMENT_SERVICE_URL   | URL interna del payment-service     |

## Endpoints Propios

### Health Check

```http
GET /health
```

Ejemplo de uso:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "api-gateway"
}
```

---

### Metrics

```http
GET /metrics
```

Este endpoint expone métricas en formato Prometheus para observabilidad del sistema.

Ejemplo:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/metrics"
```

## Proxy de rutas

El API Gateway redirige solicitudes hacia otros servicios:

| Ruta           | Servicio          |
| -------------- | ----------------- |
| `/bookings/*`  | booking-service   |
| `/inventory/*` | inventory-service |
| `/payments/*`  | payment-service   |

## Ejecución con Docker Compose

Desde la raíz del proyecto:

```powershell
docker compose up -d api-gateway
```

Ver logs:

```powershell
docker logs soldout-api-gateway --tail 50
```

## Validación rápida

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

Si el servicio responde con `status: ok`, el API Gateway está funcionando correctamente.
