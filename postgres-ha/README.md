# PostgreSQL High Availability con Patroni, etcd y HAProxy

## Despliegue

1. Arranca el cluster HA en background:
```bash
docker compose -f docker-compose.patroni.yml up -d
```

2. Verifica los logs para asegurar que el líder ha sido elegido:
```bash
docker logs patroni-primary
docker logs patroni-replica
```

## Monitorización (HAProxy)

HAProxy expone una interfaz gráfica de estadísticas. Puedes accederla en tu navegador para ver la salud de los nodos y confirmar quién tiene el tráfico:
* **URL:** [http://localhost:8404](http://localhost:8404)

El nodo en color verde (`UP`) es el `primary`, el que esté en rojo (`DOWN` debido a que el healthcheck `/master` retorna 503) es el `replica`.

## Restauración de Datos Inicial (Migración)

Dado que HAProxy no tiene el cliente `psql`, inyectaremos el backup directamente desde el contenedor del nodo primario:

```bash
# 1. Crear la base de datos "soldout" con dueño "admin"
docker exec -i patroni-primary psql -U postgres -c "CREATE DATABASE soldout OWNER admin;"

# 2. Restaurar el backup (usar cmd /c en Windows para evitar corrupción de encoding por PowerShell)
cmd /c "docker exec -i patroni-primary psql -U admin -d soldout < backups\soldout_backup_before_patroni.sql"
```

## Testing de Alta Disponibilidad

### Simulación de Failover (Caída Inesperada)
Detén el contenedor primario abruptamente:
```bash
docker stop patroni-primary
```
Patroni detectará la ausencia del líder y promoverá la réplica. HAProxy actualizará automáticamente el enrutamiento.

### Simulación de Switchover (Mantenimiento Programado)
Si quieres realizar un cambio de rol de manera ordenada sin pérdida de transacciones en vuelo, usa `patronictl`:
```bash
docker exec -it patroni-primary patronictl -c /patroni.yml switchover
```
