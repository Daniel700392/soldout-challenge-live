# -------------------------------------------------------------------------
# Cleanup script – removes backup files older than 7 days from every
# backup sub‑folder (full, frequent, wal).
# Intended to be run once a day (e.g., via a Scheduled Task).
# -------------------------------------------------------------------------
$folders = @("backups/full","backups/frequent","backups/wal")
foreach ($f in $folders) {
    if (Test-Path $f) {
        Get-ChildItem -Path $f -File |
            Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
            Remove-Item -Force
        Write-Host "Old files removed from $f"
    }
}
