# -------------------------------------------------------------------------
# Frequent logical backup – runs every 15 minutes
# Detects the current Patroni leader (via patronictl) and dumps the `soldout` database using the built‑in `postgres` super‑user.
# Backups are stored in ./backups/frequent/
# -------------------------------------------------------------------------
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
Write-Host "Running frequent backup on leader container: $leader"

# Dump the `soldout` DB with the `postgres` super‑user
docker exec $leader pg_dump -U postgres soldout > "backups/frequent/soldout_frequent_$timestamp.sql"
Write-Host "Frequent backup saved: backups/frequent/soldout_frequent_$timestamp.sql"
