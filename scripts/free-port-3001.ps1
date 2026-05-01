$pid = (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty OwningProcess)
if ($pid) {
  Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  Write-Host "Processus $pid libéré sur le port 3001."
} else {
  Write-Host "Port 3001 déjà libre."
}
