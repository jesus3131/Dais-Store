$root = Split-Path $MyInvocation.MyCommand.Path

Write-Host "=== Dais Store - DEMO ===" -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "[1/2] Iniciando servidor API..." -ForegroundColor Yellow
$server = Start-Process pwsh -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd '$root\server'; node start.js" -PassThru

Start-Sleep -Seconds 2

# Start frontend
Write-Host "[2/2] Iniciando landing page..." -ForegroundColor Yellow
$frontend = Start-Process pwsh -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd '$root\landing-react'; npm run dev:host" -PassThru

Start-Sleep -Seconds 4

# Get local IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
  $_.IPAddress -match '^\d+\.\d+\.\d+\.\d+$' -and $_.IPAddress -notlike '127.*'
} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "=== DEMO LISTA ===" -ForegroundColor Green
Write-Host ""
Write-Host "Desde cualquier equipo en la MISMA RED abre:" -ForegroundColor White
Write-Host "  http://$($ip):5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:  http://$($ip):4000/api/health" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Cierra las dos ventanas de PowerShell para detener." -ForegroundColor Yellow
Write-Host ""

# Keep script alive
Read-Host "Presiona ENTER para cerrar todo"
$server.Kill()
$frontend.Kill()
