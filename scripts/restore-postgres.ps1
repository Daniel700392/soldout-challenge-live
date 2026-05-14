param(
  [string]$BackupFile
)

if (-not $BackupFile) {
  Write-Host "Usage: .\scripts\restore-postgres.ps1 backups\archivo.sql"
  exit 1
}

Get-Content $BackupFile | docker exec -i soldout-postgres psql -U admin -d soldout

Write-Host "Restore completed from: $BackupFile"