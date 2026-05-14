param(
    [string]$BackupFile
)

Get-Content $BackupFile | docker exec -i soldout-postgres psql -U admin -d soldout

Write-Host "Restore completed"