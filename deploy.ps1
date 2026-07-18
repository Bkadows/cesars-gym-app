# César's Gym Deploy Script
$nodeDir = "C:\Users\Yosuaph\Desktop\CESARSGYM\node"
$env:PATH = "$nodeDir;" + $env:PATH

Write-Host "Iniciando proceso de despliegue para Cesar's Gym..." -ForegroundColor Cyan

# Intentar verificar sesión o iniciar
Write-Host "`n[1/2] Verificando sesión de Firebase..." -ForegroundColor Yellow
try {
    & "$nodeDir\npx.cmd" firebase login
} catch {
    Write-Host "Error al intentar iniciar sesión: $_" -ForegroundColor Red
    exit 1
}

# Desplegar cambios
Write-Host "`n[2/2] Desplegando archivos a Firebase Hosting..." -ForegroundColor Yellow
& "$nodeDir\npx.cmd" firebase deploy

Write-Host "`n¡Proceso finalizado!" -ForegroundColor Green
