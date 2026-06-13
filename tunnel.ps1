param(
  [int]$Port = 5173
)

$root = Split-Path $MyInvocation.MyCommand.Path

Write-Host "=== Dais Store - ACCESO PUBLICA ===" -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "[1] Iniciando servidor API..." -ForegroundColor Yellow
$server = Start-Process pwsh -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd '$root\server'; node start.js" -PassThru
Start-Sleep -Seconds 2

# Start frontend
Write-Host "[2] Iniciando landing page..." -ForegroundColor Yellow
$frontend = Start-Process pwsh -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd '$root\landing-react'; npm run dev:host" -PassThru
Start-Sleep -Seconds 4

# Tunnel SSH
Write-Host "[3] Abriendo tunnel publico..." -ForegroundColor Yellow
Write-Host "    (Se abrira una ventana SSH, busca la linea que dice 'https://...loca.lt')" -ForegroundColor DarkGray
Start-Sleep -Seconds 1

$tunnel = Start-Process pwsh -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "ssh -o StrictHostKeyChecking=no -R 80:localhost:$Port nokey@localhost.run" -PassThru

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Busca la URL 'https://....loca.lt' en la       ║" -ForegroundColor Cyan
Write-Host "║  nueva ventana SSH y enviasela a tu cliente     ║" -ForegroundColor Cyan
Write-Host "╠══════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  Alternativa (misma red):                       ║" -ForegroundColor Cyan
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match '^\d+\.\d+\.\d+\.\d+$' -and $_.IPAddress -notlike '127.*' } | Select-Object -First 1).IPAddress
Write-Host "║  http://$($ip):$Port                           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona ENTER para cerrar todo" -ForegroundColor Yellow
Read-Host

$server.Kill()
$frontend.Kill()
$tunnel.Kill()
Write-Host "Detenido." -ForegroundColor Green
