# Full logical backup (all databases) – run every 6 hours
# Detects the current Patroni leader (via patronictl) and executes pg_dumpall there.
# Uses the built‑in super‑user `postgres`.
# Backups are stored in ./backups/full/
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

function Get-LeaderContainer {
    $containers = docker ps --filter "name=patroni-" --format "{{.Names}}"
    foreach ($c in $containers) {
        try {
            $jsonRaw = docker exec $c patronictl -c /patroni.yml list --format=json
            $json = $jsonRaw | ConvertFrom-Json
            foreach ($member in $json) {
                if ($member.Role -eq "Leader") {
                    return $member.Member
                }
            }
        } catch {
            Write-Host "Could not read Patroni state from $c"
        }
    }
    throw "Leader container not found"
}

$leader = Get-LeaderContainer
Write-Host "Running full backup on leader container: $leader"

docker exec $leader pg_dumpall -U postgres > "backups/full/soldout_full_$timestamp.sql"
Write-Host "Full backup saved: backups/full/soldout_full_$timestamp.sql"
