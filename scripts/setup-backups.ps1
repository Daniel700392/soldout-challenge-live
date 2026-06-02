Write-Host "====================================="
Write-Host " SOLDOUT BACKUP AUTO-SETUP"
Write-Host "====================================="

$projectPath = Split-Path -Parent $PSScriptRoot

# FULL BACKUP (6 HOURS)
$fullAction = New-ScheduledTaskAction `
-Execute "powershell.exe" `
-Argument "-ExecutionPolicy Bypass -File `"$projectPath\scripts\backup_full.ps1`""

$fullTrigger = New-ScheduledTaskTrigger `
-Once -At (Get-Date) `
-RepetitionInterval (New-TimeSpan -Hours 6)

Register-ScheduledTask `
-TaskName "SoldOut-Full-Backup" `
-Action $fullAction `
-Trigger $fullTrigger `
-Description "Full backup every 6 hours for SoldOut Challenge Live" `
-Force

Write-Host "[OK] Full backup task created"


# FREQUENT BACKUP (15 MINUTES)
$frequentAction = New-ScheduledTaskAction `
-Execute "powershell.exe" `
-Argument "-ExecutionPolicy Bypass -File `"$projectPath\scripts\backup_frequent.ps1`""

$frequentTrigger = New-ScheduledTaskTrigger `
-Once -At (Get-Date) `
-RepetitionInterval (New-TimeSpan -Minutes 15)

Register-ScheduledTask `
-TaskName "SoldOut-Frequent-Backup" `
-Action $frequentAction `
-Trigger $frequentTrigger `
-Description "Frequent backup every 15 minutes for SoldOut Challenge Live" `
-Force

Write-Host "[OK] Frequent backup task created"


# CLEANUP (WEEKLY)
$cleanupAction = New-ScheduledTaskAction `
-Execute "powershell.exe" `
-Argument "-ExecutionPolicy Bypass -File `"$projectPath\scripts\cleanup_backups.ps1`""

$cleanupTrigger = New-ScheduledTaskTrigger `
-Weekly `
-DaysOfWeek Sunday `
-At 3:00AM

Register-ScheduledTask `
-TaskName "SoldOut-Backup-Cleanup" `
-Action $cleanupAction `
-Trigger $cleanupTrigger `
-Description "Cleanup backups every 7 days for SoldOut Challenge Live" `
-Force

Write-Host "[OK] Cleanup task created"

Write-Host ""
Write-Host "====================================="
Write-Host " BACKUP SETUP COMPLETED"
Write-Host "====================================="