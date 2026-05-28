$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

docker exec soldout-postgres pg_dump -U admin soldout > backups/soldout-$timestamp.sql

Write-Host "Backup completed: soldout-$timestamp.sql"