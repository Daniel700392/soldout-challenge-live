$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "backups/soldout_$timestamp.sql"

docker exec soldout-postgres pg_dump -U admin -d soldout > $backupFile

Write-Host "Backup created: $backupFile"