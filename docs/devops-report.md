# Sold-Out Challenge Live — DevOps Technical Report

## Integrante Responsable

Persona 4 — DevOps / Kubernetes / Cloud / Backups / Observabilidad / Resiliencia / k6

---

# 1. Introducción

Sold-Out Challenge Live es una plataforma distribuida de venta masiva de boletos diseñada para soportar alta concurrencia, evitar sobreventa y mantener disponibilidad incluso ante fallos parciales de infraestructura.

La solución fue construida utilizando arquitectura de microservicios desplegada con Docker Compose y Kubernetes, incorporando observabilidad, pruebas de carga, chaos engineering y backups automatizados.

---

# 2. Arquitectura General

## Microservicios

- api-gateway
- booking-service
- inventory-service
- payment-service
- notification-service

## Infraestructura

- Docker
- Docker Compose
- Kubernetes
- PostgreSQL
- Redis
- RabbitMQ
- Prometheus
- Grafana
- k6

---

# 3. Docker Compose

Se configuró Docker Compose para levantar toda la plataforma localmente.

## Servicios incluidos

- PostgreSQL
- Redis
- RabbitMQ
- Prometheus
- Grafana
- api-gateway
- booking-service
- inventory-service
- payment-service
- notification-service

## Características implementadas

- restart: always
- networking compartido
- variables de entorno
- persistencia de datos
- exposición de puertos

---

# 4. Kubernetes

Se implementó Kubernetes utilizando Docker Desktop Kubernetes.

## Deployments configurados

- api-gateway-deployment
- booking-deployment
- inventory-deployment
- payment-deployment
- notification-deployment
- postgres-deployment
- rabbitmq-deployment
- redis-deployment

## Services configurados

- ClusterIP internos
- NodePort para api-gateway
- comunicación interna entre microservicios

## Réplicas

- api-gateway: 2
- booking-service: 3
- inventory-service: 3
- payment-service: 3
- notification-service: 2

---

# 5. Alta Disponibilidad y Resiliencia

La plataforma fue diseñada para mantener disponibilidad incluso ante fallos parciales.

## Características implementadas

- múltiples réplicas
- autorecuperación de pods
- balanceo de carga
- degradación controlada
- aislamiento de fallos

---

# 6. Chaos Engineering

Se realizaron pruebas destructivas controladas para validar resiliencia.

## Eliminación manual de pods

Se eliminaron pods manualmente utilizando:

```powershell
kubectl delete pod
```

Resultado:

Kubernetes recreó automáticamente los pods eliminados.

---

## Reinicio de Redis

```powershell
kubectl delete pod -l app=redis
```

Resultado:

Redis fue restaurado automáticamente.

---

## Reinicio de RabbitMQ

```powershell
kubectl delete pod -l app=rabbitmq
```

Resultado:

RabbitMQ fue restaurado automáticamente.

---

## Escalado dinámico

```powershell
kubectl scale deployment inventory-deployment --replicas=1

kubectl scale deployment inventory-deployment --replicas=3
```

Resultado:

Kubernetes ajustó correctamente el número de pods.

---

## Degradación controlada

```powershell
kubectl scale deployment notification-deployment --replicas=0

kubectl scale deployment notification-deployment --replicas=2
```

Resultado:

El sistema continuó operando incluso sin notification-service.

---

# 7. Horizontal Pod Autoscaler (HPA)

Se configuró un Horizontal Pod Autoscaler para inventory-service.

## Configuración

- minReplicas: 1
- maxReplicas: 5
- target CPU: 50%

## Archivo utilizado

```txt
k8s/inventory-hpa.yml
```

## Metrics Server

También se instaló metrics-server para permitir monitoreo de CPU y memoria.

## Comandos utilizados

```powershell
kubectl top pods

kubectl get hpa
```

## Resultado

Kubernetes logró monitorear uso de CPU y habilitar autoscaling automático.

---

# 8. Monitoreo y Observabilidad

Se implementó observabilidad utilizando Prometheus y Grafana.

## Prometheus

Se configuró Prometheus para monitorear:

- prometheus
- inventory-service
- payment-service
- notification-service

## Grafana

Se creó dashboard:

```txt
Sold-Out Challenge Live Monitoring
```

## Métricas monitoreadas

- estado UP/DOWN
- requests HTTP
- latencia
- disponibilidad de servicios
- consumo de CPU
- métricas de microservicios

## Dashboard exportado

El dashboard fue exportado como:

```txt
monitoring/grafana-dashboard.json
```

---

# 9. Backups PostgreSQL

Se implementó respaldo automatizado PostgreSQL.

## Script de backup

```powershell
scripts/backup-postgres.ps1
```

## Script de restauración

```powershell
scripts/restore-postgres.ps1
```

## Características

- generación de archivos .sql
- almacenamiento local
- restauración de base de datos
- respaldo manual inmediato

## Git Ignore

La carpeta backups/ fue agregada al .gitignore para evitar subir respaldos reales.

---

# 10. Load Testing con k6

Se realizaron pruebas de carga utilizando Grafana k6.

## Herramienta utilizada

- Grafana k6
- Docker

---

## Load Test

### Escenario

- 50 usuarios virtuales
- 50,000 requests
- endpoint /health

### Resultados

- 50,000 requests exitosas
- 0% errores
- throughput aproximado: 477 requests/segundo
- latencia promedio: 4.11 ms
- p95: 5.39 ms

---

## Spike Test

### Escenario

- hasta 100 usuarios virtuales
- aumento rápido de tráfico

### Resultados

- 13,367 requests exitosas
- 0% errores
- throughput aproximado: 190 requests/segundo
- latencia promedio: 2.54 ms
- p95: 3.51 ms

---

# 11. Problemas Encontrados y Soluciones

## Problema 1 — ErrImageNeverPull

Kubernetes no encontraba imágenes Docker locales.

### Solución

- reconstrucción de imágenes
- rollout restart
- recreación de pods

---

## Problema 2 — booking-service fallando

Los pods intentaban crear tablas simultáneamente.

### Solución temporal

Se deshabilitó inicialización automática concurrente.

### Pendiente futuro

Implementar migraciones profesionales.

---

## Problema 3 — api-gateway fallando

El gateway apuntaba al puerto incorrecto.

### Solución

Se corrigieron rutas y puertos internos.

---

## Problema 4 — Prometheus targets DOWN

Prometheus intentaba scrapear endpoints inválidos.

### Solución

Se configuró correctamente:

```txt
/metrics
```

---

## Problema 5 — PowerShell bloqueando scripts

Windows impedía ejecutar scripts .ps1.

### Solución

Se modificó ExecutionPolicy temporalmente.

---

## Problema 6 — metrics-server no funcionaba

Kubernetes no exponía métricas CPU.

### Solución

Se aplicó patch:

```txt
--kubelet-insecure-tls
```

---

# 12. Pendientes Técnicos

Pendientes identificados para producción real:

- kube-state-metrics
- node-exporter
- postgres-exporter
- redis-exporter
- rabbitmq-exporter
- alertas Grafana
- CI/CD
- PostgreSQL réplica
- Kubernetes Secrets
- métricas custom Prometheus
- autoscaling avanzado
- despliegue cloud

---

# 13. Tecnologías Utilizadas

## Backend

- Node.js
- Express

## Infraestructura

- Docker
- Docker Compose
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

- Grafana k6

---

# 14. Conclusión

La parte DevOps logró transformar la plataforma en un sistema distribuido resiliente y observable.

La solución implementó exitosamente:

- Kubernetes
- alta disponibilidad
- autorecuperación
- chaos engineering
- monitoreo centralizado
- dashboards
- backups
- load testing
- autoscaling
- observabilidad

El sistema demostró estabilidad bajo carga y capacidad de recuperación automática ante fallos controlados.