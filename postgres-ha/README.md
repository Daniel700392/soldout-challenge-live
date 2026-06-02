# PostgreSQL High Availability (Patroni)

## Descripción

La carpeta `postgres-ha` contiene la configuración de **alta disponibilidad (High Availability - HA)** para PostgreSQL dentro del proyecto **SoldOut Challenge Live**.

Se implementó una arquitectura basada en:

* **PostgreSQL**
* **Patroni**
* **etcd**
* **WAL Replication**

El objetivo principal es garantizar continuidad del servicio ante fallos de un nodo primario.

---

## Objetivo

El sistema de alta disponibilidad fue implementado para:

* Evitar puntos únicos de falla.
* Garantizar continuidad operativa.
* Mantener replicación entre nodos PostgreSQL.
* Permitir failover automático.
* Incrementar resiliencia del sistema.

---

## Arquitectura HA

El sistema PostgreSQL HA se compone de:

### Primary Node

Nodo principal encargado de:

* Escrituras
* Transacciones
* Replicación hacia réplicas

---

### Replica Node

Nodo secundario encargado de:

* Replicación de datos
* Disponibilidad ante fallos
* Promoción automática en failover

---

### etcd

`etcd` funciona como **Distributed Configuration Store (DCS)**.

Responsabilidades:

* Elegir líder del clúster.
* Coordinar failover.
* Mantener estado distribuido.
* Evitar split-brain.

---

## Estructura

```text id="zv49a2"
postgres-ha/
│── patroni-primary/
│── patroni-replica/
│── etcd/
│── scripts/
│── docker-compose.yml
```

---

## Componentes utilizados

| Tecnología      | Uso                      |
| --------------- | ------------------------ |
| PostgreSQL      | Persistencia principal   |
| Patroni         | Orquestación HA          |
| etcd            | Coordinación distribuida |
| WAL Replication | Replicación de cambios   |

---

## Levantar el Clúster HA

Desde la raíz del proyecto:

```powershell id="4l8msp"
docker compose up -d
```

Ver contenedores:

```powershell id="4pxyr2"
docker ps
```

Verificar que existan:

```text id="65yqun"
patroni-primary
patroni-replica
soldout-etcd
```

---

## Verificar Estado del Clúster

Ejecutar:

```powershell id="jlwm7t"
docker exec -it patroni-primary patronictl list
```

Ejemplo esperado:

```text id="0mxkrw"
+ Cluster: soldout (xxxxxxx) --------+
| Member            | Role    | State |
|-------------------|---------|-------|
| patroni-primary   | Leader  | running |
| patroni-replica   | Replica | running |
+------------------------------------+
```

---

## Validar Replicación

Ejemplo:

Crear datos en primary:

```sql id="hvd4cc"
INSERT INTO bookings (...) VALUES (...);
```

Consultar desde réplica:

```sql id="n6vw3o"
SELECT * FROM bookings;
```

La información debe aparecer sincronizada.

---

## Simular Failover

Detener el nodo líder:

```powershell id="s6tf5v"
docker stop patroni-primary
```

Verificar nuevamente:

```powershell id="o91tzx"
docker exec -it patroni-replica patronictl list
```

Resultado esperado:

La réplica debe promoverse automáticamente a **Leader**.

---

## Backups y Recuperación

El sistema fue configurado para soportar:

* Backups PostgreSQL
* WAL Archiving
* Recuperación ante fallos

Ejemplo de backup:

```powershell id="t9zj8r"
pg_dump -U admin soldout > backup.sql
```

Ejemplo de restauración:

```powershell id="im6v4n"
psql -U admin soldout < backup.sql
```

---

## Validaciones Realizadas

Durante el proyecto se validó:

✅ Replicación funcionando
✅ Failover automático
✅ Cambio de líder exitoso
✅ Persistencia de datos
✅ Recuperación ante fallos
✅ Patroni funcionando correctamente

---

## Importancia dentro del proyecto

La implementación de PostgreSQL HA garantiza que el sistema **SoldOut Challenge Live** pueda continuar operando incluso ante la caída de un nodo de base de datos, aumentando resiliencia y disponibilidad del sistema.
