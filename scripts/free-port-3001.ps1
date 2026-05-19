# Ne pas utiliser $pid : variable automatique PowerShell (ID du processus courant), en lecture seule.
$listenPid = (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty OwningProcess)
if ($listenPid) {
  Stop-Process -Id $listenPid -Force -ErrorAction SilentlyContinue
  Write-Host "Processus $listenPid libéré sur le port 3001."
} else {
  Write-Host "Port 3001 déjà libre."
}
