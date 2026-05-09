# DevOps Connection Guide - SoldOut Challenge Live

## Servicios internos en Kubernetes

Los microservicios deben conectarse usando estos hostnames internos:

| Servicio | Hostname | Puerto |
|---|---|---|
| PostgreSQL | postgres-service | 5432 |
| Redis | redis-service | 6379 |
| RabbitMQ | rabbitmq-service | 5672 |

---

# Variables recomendadas para los microservicios

## Variables base

```env
DB_HOST=postgres-service
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=soldout

REDIS_HOST=redis-service
REDIS_PORT=6379

RABBITMQ_URL=amqp://guest:guest@rabbitmq-service:5672
```

---

# Endpoints obligatorios por microservicio

Cada microservicio debe implementar:

```txt
GET /health
GET /metrics
```

---

# Puertos recomendados

| Servicio | Puerto |
|---|---|
| api-gateway | 3000 |
| booking-service | 3001 |
| inventory-service | 3002 |
| payment-service | 3003 |
| notification-service | 3004 |

---

# Requisitos para Dockerfile

Cada microservicio debe tener un Dockerfile con esta estructura base:

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "src/app.js"]
```

---

# Importante

NO usar localhost dentro de Kubernetes.

❌ Incorrecto:

```txt
localhost
```

✅ Correcto:

```txt
postgres-service
redis-service
rabbitmq-service
```

Kubernetes resuelve automáticamente estos nombres mediante DNS interno.

---

# Archivos .env.example

## inventory-service/.env.example

```env
PORT=3002

DB_HOST=postgres-service
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=soldout

REDIS_HOST=redis-service
REDIS_PORT=6379

RABBITMQ_URL=amqp://guest:guest@rabbitmq-service:5672
```

---

## booking-service/.env.example

```env
PORT=3001

DB_HOST=postgres-service
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=soldout

INVENTORY_SERVICE_URL=http://inventory-service:3002
PAYMENT_SERVICE_URL=http://payment-service:3003

RABBITMQ_URL=amqp://guest:guest@rabbitmq-service:5672
```

---

## payment-service/.env.example

```env
PORT=3003

DB_HOST=postgres-service
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=soldout

RABBITMQ_URL=amqp://guest:guest@rabbitmq-service:5672
```

---

## notification-service/.env.example

```env
PORT=3004

RABBITMQ_URL=amqp://guest:guest@rabbitmq-service:5672
```

---

## api-gateway/.env.example

```env
PORT=3000

BOOKING_SERVICE_URL=http://booking-service:3001
INVENTORY_SERVICE_URL=http://inventory-service:3002
PAYMENT_SERVICE_URL=http://payment-service:3003
```

---

# Arquitectura actual Kubernetes

Actualmente desplegado en Kubernetes:

✅ PostgreSQL  
✅ Redis  
✅ RabbitMQ  
✅ nginx deployment  
✅ Kubernetes Services  
✅ PersistentVolumeClaim  
✅ Self-healing  
✅ Replicas  
✅ Networking interno

---

# Recomendaciones para el equipo

1. Trabajar siempre en ramas feature/*
2. No hacer push directo a main
3. Cada servicio debe incluir:
   - Dockerfile
   - .env.example
   - /health
   - /metrics
4. Usar variables de entorno
5. No hardcodear IPs
6. Usar hostnames Kubernetes

---

# Comandos útiles Kubernetes

## Ver pods

```bash
kubectl get pods
```

## Ver services

```bash
kubectl get services
```

## Ver logs

```bash
kubectl logs <pod-name>
```

## Eliminar pod (prueba resiliencia)

```bash
kubectl delete pod <pod-name>
```

## Port forward

```bash
kubectl port-forward service/rabbitmq-service 15672:15672
```

---

# Objetivo final

Demostrar:

✅ sistemas distribuidos  
✅ concurrencia  
✅ tolerancia a fallos  
✅ persistencia  
✅ observabilidad  
✅ recuperación automática  
✅ alta disponibilidad