# 🎟️ SoldOut Challenge Live

<div align="center">

### Plataforma Distribuida de Venta Masiva de Boletos con Alta Disponibilidad, Observabilidad y Prevención de Sobreventa

Sistema resiliente basado en **microservicios**, diseñado para soportar **alta concurrencia**, evitar **sobreventa de asientos**, prevenir **pagos duplicados** y garantizar **consistencia transaccional** mediante una arquitectura distribuida.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)

</div>

---

# 📌 Descripción del Proyecto

**SoldOut Challenge Live** es una plataforma distribuida de venta de boletos desarrollada bajo una arquitectura de **microservicios resiliente**, diseñada para enfrentar escenarios de alta demanda y garantizar integridad en las reservas de asientos.

El sistema busca resolver problemas comunes en plataformas de venta masiva de boletos como:

- ❌ Sobreventa de asientos
- ❌ Pagos duplicados
- ❌ Estados inconsistentes entre servicios
- ❌ Fallos bajo alta concurrencia
- ❌ Pérdida de eventos entre servicios

Para ello, se implementaron mecanismos de:

✅ **Saga Pattern** para consistencia distribuida  
✅ **Idempotencia** mediante `requestId` único  
✅ **Locks distribuidos con Redis**  
✅ **Mensajería asíncrona con RabbitMQ**  
✅ **Alta disponibilidad con Patroni + etcd**  
✅ **Observabilidad con Prometheus + Grafana**  
✅ **Pruebas de carga con k6**  
✅ **Pruebas funcionales con Postman**

---

# 🎯 Objetivos del Proyecto

## Objetivo General

Diseñar e implementar una plataforma distribuida de venta de boletos capaz de soportar alta concurrencia, prevenir sobreventa y mantener consistencia entre microservicios mediante mecanismos de resiliencia y observabilidad.

## Objetivos Específicos

- Implementar arquitectura basada en microservicios.
- Garantizar consistencia distribuida usando **Saga Pattern**.
- Evitar reservas duplicadas mediante **idempotencia**.
- Prevenir sobreventa usando **locks distribuidos con Redis**.
- Implementar comunicación asíncrona mediante **RabbitMQ**.
- Desplegar infraestructura usando **Docker Compose** y **Kubernetes**.
- Implementar monitoreo en tiempo real usando **Prometheus + Grafana**.
- Realizar pruebas funcionales y de carga usando **Postman** y **k6**.

---

# 🏗️ Arquitectura General del Sistema

El sistema sigue una arquitectura distribuida basada en microservicios:

```text
                    ┌───────────────────┐
                    │      Usuario      │
                    │ Postman / Cliente │
                    └─────────┬─────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │      API Gateway       │
                 │       Port: 3000       │
                 └─────────┬──────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Booking Service│ │Inventory Service│ │ Payment Service│
│   Port: 3004   │ │    Port: 3002   │ │    Port: 3003  │
└────────┬───────┘ └────────┬────────┘ └────────┬───────┘
         │                  │                   │
         │                  ▼                   ▼
         │         ┌──────────────┐     ┌──────────────┐
         │         │    Redis     │     │  RabbitMQ    │
         │         │ Distributed  │     │ Event Broker │
         │         │    Locks     │     └──────┬───────┘
         │         └──────────────┘            │
         │                                      ▼
         │                          ┌────────────────────┐
         │                          │ Notification Service│
         │                          │      Port: 3005     │
         │                          └────────────────────┘
         │
         ▼
┌───────────────────────────┐
│ PostgreSQL + Patroni HA   │
│ Alta Disponibilidad (HA)  │
└───────────────────────────┘

```

---

# ⚙️ Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Node.js + Express** | Desarrollo de microservicios |
| **PostgreSQL** | Persistencia de datos |
| **Redis** | Locks distribuidos y control de concurrencia |
| **RabbitMQ** | Comunicación asíncrona basada en eventos |
| **Docker Compose** | Orquestación local de contenedores |
| **Kubernetes** | Despliegue distribuido |
| **Patroni + etcd** | Alta disponibilidad PostgreSQL |
| **Prometheus** | Recolección de métricas |
| **Grafana** | Visualización y monitoreo |
| **k6** | Pruebas de carga y concurrencia |
| **Postman** | Pruebas funcionales API |

---

# 🧩 Microservicios del Sistema

| Servicio | Puerto | Responsabilidad |
|----------|--------|----------------|
| **API Gateway** | `3000` | Punto único de entrada y proxy |
| **Booking Service** | `3004` | Orquestación de reservas y Saga |
| **Inventory Service** | `3002` | Gestión de asientos y locks |
| **Payment Service** | `3003` | Procesamiento de pagos |
| **Notification Service** | `3005` | Consumo de eventos RabbitMQ |
| **PostgreSQL** | `5432` | Persistencia de datos |
| **Redis** | `6379` | Control de concurrencia |
| **RabbitMQ** | `5672` / `15672` | Broker de eventos |
| **Prometheus** | `9090` | Monitoreo |
| **Grafana** | `3001` | Dashboard visual |

---

# 📂 Estructura del Repositorio

```text
soldout-challenge-live/
│── api-gateway/              # Punto único de entrada
│── booking-service/          # Saga de reservas
│── inventory-service/        # Gestión de asientos
│── payment-service/          # Procesamiento de pagos
│── notification-service/     # Consumo de eventos
│── monitoring/               # Prometheus + Grafana
│── postgres-ha/              # Patroni + etcd
│── k8s/                      # Manifiestos Kubernetes
│── migrations/               # Scripts SQL
│── k6/                       # Pruebas de carga
│── postman/                  # Colección Postman
│── scripts/                  # Scripts auxiliares
│── tests/                    # Pruebas adicionales
│── docker-compose.yml        # Infraestructura local
│── README.md                 # Documentación principal
```

---

# 🚀 Características Implementadas

- ✅ Arquitectura basada en microservicios
- ✅ Saga Pattern
- ✅ Idempotencia
- ✅ Anti-overbooking
- ✅ Locks distribuidos con Redis
- ✅ RabbitMQ Event Driven
- ✅ PostgreSQL HA con Patroni
- ✅ Observabilidad con Prometheus/Grafana
- ✅ Dashboard persistente
- ✅ Postman Collection
- ✅ Pruebas de carga k6
- ✅ Health Checks
- ✅ Metrics Endpoints
- ✅ Docker Compose
- ✅ Kubernetes manifests

---
# 🐳 Ejecución del Proyecto con Docker Compose

## Requisitos Previos

Antes de levantar el sistema, asegúrate de tener instalado:

- Docker Desktop
- Docker Compose
- Git
- Node.js (opcional para desarrollo local)
- Postman (para pruebas API)

Verifica Docker:

```powershell
docker --version
docker compose version
```

---

## Clonar el Repositorio

```powershell
git clone https://github.com/Daniel700392/soldout-challenge-live.git

cd soldout-challenge-live
```

---

## Levantar Todo el Sistema

Ejecuta el siguiente comando:

```powershell
docker compose up -d
```

Esto levantará automáticamente:

- PostgreSQL
- Redis
- RabbitMQ
- Prometheus
- Grafana
- API Gateway
- Booking Service
- Inventory Service
- Payment Service
- Notification Service

---

## Verificar Contenedores

```powershell
docker ps
```

Deberías ver contenedores similares a:

```text
soldout-postgres
soldout-redis
soldout-rabbitmq
soldout-prometheus
soldout-grafana
soldout-api-gateway
soldout-booking-service
soldout-inventory-service
soldout-payment-service
soldout-notification-service
```

---

## Detener el Sistema

```powershell
docker compose down
```

Eliminar también volúmenes:

```powershell
docker compose down -v
```

---

# 🌐 Servicios y Puertos

| Servicio | URL |
|----------|-----|
| API Gateway | http://localhost:3000 |
| Grafana | http://localhost:3001 |
| Inventory Service | http://localhost:3002 |
| Payment Service | http://localhost:3003 |
| Booking Service | http://localhost:3004 |
| Notification Service | http://localhost:3005 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| RabbitMQ | http://localhost:15672 |
| Prometheus | http://localhost:9090 |

---

# ❤️ Health Checks

Todos los microservicios exponen endpoints de salud para validar disponibilidad.

## API Gateway

```http
GET http://localhost:3000/health
```

---

## Booking Service

```http
GET http://localhost:3004/health
```

---

## Inventory Service

```http
GET http://localhost:3002/health
```

---

## Payment Service

```http
GET http://localhost:3003/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "booking-service"
}
```

---

# 🔌 Endpoints Principales

## Booking Service

### Crear Reserva de Asiento

```http
POST /bookings/seat
```

Ejemplo:

```json
{
  "eventId": "99999999-9999-9999-9999-999999999999",
  "userId": "11111111-1111-1111-1111-111111111111",
  "seatCode": "A5",
  "requestId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5",
  "amount": 150
}
```

Respuesta exitosa:

```http
201 Created
```

---

### Protección contra Sobreventa

Intentar reservar el mismo asiento devuelve:

```http
409 Conflict
```

Esto garantiza que no existan dos reservas confirmadas sobre el mismo asiento.

---

## Inventory Service

### Obtener Inventario de Evento

```http
GET /inventory/events/:eventId/seats
```

---

### Reservar Asiento

```http
POST /inventory/seats/reserve
```

---

### Confirmar Asiento

```http
POST /inventory/seats/confirm
```

---

### Liberar Asiento

```http
POST /inventory/seats/release
```

---

## Payment Service

El servicio de pagos participa dentro del flujo de reserva mediante comunicación interna desde el `booking-service`.

En el flujo principal, el cliente no necesita llamar directamente al servicio de pagos. El pago se ejecuta automáticamente cuando se crea una reserva mediante:

POST /bookings/seat

Body:

```json
{
  "bookingId": "test-booking-123",
  "amount": 150
}
```

---

# 📬 Colección Postman

El proyecto incluye una colección Postman lista para ejecutar pruebas funcionales.

Ubicación:

```text
postman/SoldOut-Challenge-Live.postman_collection.json
```

## Importar Colección

1. Abrir Postman.
2. Presionar **Import**.
3. Seleccionar el archivo:

```text
postman/SoldOut-Challenge-Live.postman_collection.json
```

---

## Pruebas Incluidas

### Health Checks

Valida que todos los servicios estén activos.

### Booking Flow

Valida:

- creación de reservas
- confirmación de asientos
- amount = 150
- idempotencia
- protección contra sobreventa

### Monitoring Tests

Valida exposición de métricas Prometheus.

---

# ⚡ Pruebas de Carga con k6

Los scripts de carga se encuentran en:

```text
k6/
```

Scripts disponibles:

```text
seat-random-test.js
seat-same-seat-contention-test.js
booking-50k-test.js
```

---

## Ejecutar Test de Concurrencia

```powershell
docker run --rm -i `
-v "${PWD}\k6:/scripts" `
grafana/k6 run /scripts/seat-same-seat-contention-test.js
```

---

## Resultado Esperado

- Solo **1 reserva CONFIRMED** por asiento.
- El resto de solicitudes deben ser:

```http
409 Conflict
```

Validando prevención de sobreventa.

---

# 📊 Monitoreo con Prometheus + Grafana

## Prometheus

URL:

```text
http://localhost:9090
```

Recolecta métricas desde:

- API Gateway
- Booking Service
- Inventory Service
- Payment Service
- Notification Service

---

## Grafana

URL:

```text
http://localhost:3001
```

Credenciales:

```text
Usuario: admin
Contraseña: admin
```

Dashboard monitorea:

- Requests por servicio
- Latencia HTTP
- Métricas de booking
- Estado de servicios
- Consumo de endpoints

---

# 🛡️ Alta Disponibilidad PostgreSQL (Patroni)

El proyecto incluye configuración de alta disponibilidad usando:

- Patroni
- etcd
- PostgreSQL Replication

Ubicación:

```text
postgres-ha/
```

Capacidades implementadas:

- Failover automático
- Replicación PostgreSQL
- WAL Archiving
- Promoción automática de líder

Ver estado del clúster:

```powershell
patronictl list
```

---

# 🧪 Evidencias Técnicas Validadas

Durante las pruebas del proyecto se validó:

✅ No sobreventa de asientos  
✅ Solo una reserva confirmada por asiento  
✅ amount = 150 persistido correctamente  
✅ Manejo de alta concurrencia  
✅ Rechazo de solicitudes duplicadas (`409`)  
✅ Health Checks funcionales  
✅ Métricas Prometheus funcionando  
✅ Dashboard Grafana persistente  
✅ Patroni HA validado  
✅ Postman Collection funcional  
✅ Pruebas de carga con k6

---

# 🚧 Trabajo Futuro

Mejoras futuras propuestas:

- Integración de notificaciones reales (Email/SMS)
- Dashboard avanzado de métricas
- CI/CD pipeline
- Autenticación JWT
- Rate limiting
- Despliegue cloud multi-node

---

# 👥 Equipo del Proyecto

> Editar esta sección con integrantes reales del equipo.

| Integrante | Rol |
|------------|-----|
| Daniel Martínez | DevOps / Kubernetes / Observabilidad |
| Integrante 2 | Booking + API Gateway |
| Integrante 3 | Inventory + PostgreSQL |
| Integrante 4 | Payment + RabbitMQ |

---

# 🛠️ Troubleshooting

## Contenedor no inicia

Ver logs:

```powershell
docker logs <container-name>
```

---

## Reiniciar servicios

```powershell
docker compose restart
```

---

## Ver estado de contenedores

```powershell
docker ps
```

---

## Reiniciar completamente

```powershell
docker compose down -v

docker compose up -d
```

---

# 📄 Licencia

Este proyecto se distribuye bajo licencia MIT.

Ver archivo:

```text
LICENSE
```