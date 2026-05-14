# Sold-Out Challenge Live — DevOps Report

## Integrante
Persona 4 — DevOps / Kubernetes / Cloud / Observabilidad / Resiliencia

---

# 1. Descripción General

Sold-Out Challenge Live es una plataforma distribuida de venta masiva de boletos orientada a soportar alta concurrencia, evitar sobreventa y mantener resiliencia ante fallos.

La arquitectura fue diseñada utilizando microservicios desplegados con Docker y Kubernetes, incluyendo monitoreo, pruebas de carga, chaos engineering y backups automatizados.

---

# 2. Arquitectura Utilizada

## Microservicios

- api-gateway
- booking-service
- inventory-service
- payment-service
- notification-service

## Infraestructura

- Docker Compose
- Kubernetes
- PostgreSQL
- Redis
- RabbitMQ
- Prometheus
- Grafana

---

# 3. Kubernetes

Se implementó Kubernetes local utilizando Docker Desktop Kubernetes.

## Deployments implementados

- api-gateway-deployment
- booking-deployment
- inventory-deployment
- payment-deployment
- notification-deployment
- postgres-deployment
- rabbitmq-deployment
- redis-deployment

## Características implementadas

- Réplicas múltiples
- Auto recuperación de pods
- Escalado manual
- Services internos ClusterIP
- API Gateway expuesto mediante NodePort

---

# 4. Resiliencia y Alta Disponibilidad

Se implementaron mecanismos de resiliencia utilizando Kubernetes.

## Características

- Reinicio automático de pods
- Múltiples réplicas por microservicio
- Recuperación automática tras eliminación manual
- Redis autorecuperable
- RabbitMQ autorecuperable
- Notification-service escalable

---

# 5. Chaos Engineering

Se realizaron pruebas de chaos engineering para validar la resiliencia del sistema.

## Pruebas realizadas

### Eliminación de pods

Se eliminaron pods manualmente utilizando:

```powershell
kubectl delete pod
```

Kubernetes recreó automáticamente los pods eliminados.

### Reinicio de Redis

Se eliminó el pod de Redis para validar recuperación automática.

### Reinicio de RabbitMQ

Se eliminó el pod de RabbitMQ para validar recuperación automática.

### Escalado dinámico

Se realizaron pruebas de escalado utilizando:

```powershell
kubectl scale deployment
```

---

# 6. Monitoreo y Observabilidad

Se implementó observabilidad utilizando Prometheus y Grafana.

## Herramientas

- Prometheus
- Grafana

## Métricas monitoreadas

- Estado de servicios
- Requests HTTP
- Latencia
- Estado UP/DOWN
- Métricas de microservicios

## Dashboard implementado

Dashboard principal:

Sold-Out Challenge Live Monitoring

---

# 7. Backups

Se implementaron backups automáticos de PostgreSQL.

## Script implementado

```powershell
backup-postgres.ps1
```

## Características

- Generación automática de archivos .sql
- Respaldo de base de datos soldout
- Almacenamiento en carpeta backups/

---

# 8. Pruebas de Carga

Se realizaron pruebas de carga utilizando k6.

## Herramienta utilizada

- Grafana k6

## Escenarios probados

### Load Testing

- 50 usuarios virtuales
- 50,000 requests
- Validación de latencia
- Validación de disponibilidad

### Spike Testing

- hasta 100 usuarios virtuales
- incremento rápido de tráfico
- validación de estabilidad

## Resultados

El sistema mantuvo disponibilidad y baja latencia bajo carga.

---

# 9. Tecnologías Utilizadas

## Backend

- Node.js
- Express

## Contenedores

- Docker
- Docker Compose

## Orquestación

- Kubernetes

## Base de datos

- PostgreSQL

## Cache

- Redis

## Mensajería

- RabbitMQ

## Observabilidad

- Prometheus
- Grafana

## Load Testing

- k6

---

# 10. Conclusiones

La plataforma logró implementar exitosamente:

- Arquitectura distribuida
- Resiliencia ante fallos
- Monitoreo centralizado
- Escalabilidad
- Backups
- Chaos Engineering
- Load Testing
- Alta disponibilidad

El sistema demostró capacidad de recuperación automática y estabilidad bajo carga.