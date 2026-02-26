# Script para facilitar Docker no Windows
# Uso: .\docker-cli.ps1 [comando]

param(
    [Parameter(Position = 0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host @"
🐳 Vale Church Docker CLI

Comandos disponíveis:

  .\docker-cli.ps1 build        - Build das imagens
  .\docker-cli.ps1 up           - Rodar containers (docker-compose up)
  .\docker-cli.ps1 down         - Parar containers
  .\docker-cli.ps1 logs         - Ver logs em tempo real
  .\docker-cli.ps1 clean        - Limpar containers/imagens paradas
  .\docker-cli.ps1 rebuild      - Build + up (fresh)
  .\docker-cli.ps1 status       - Ver status dos containers
  .\docker-cli.ps1 shell-backend - Entrar no shell do backend
  .\docker-cli.ps1 shell-frontend - Entrar no shell do frontend
  .\docker-cli.ps1 help         - Mostrar esta mensagem

Exemplos:
  .\docker-cli.ps1 up
  .\docker-cli.ps1 logs
  .\docker-cli.ps1 rebuild
"@
}

function Build-Images {
    Write-Host "📦 Building images..." -ForegroundColor Cyan
    docker-compose build --no-cache
}

function Up-Containers {
    Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
    docker-compose up -d
    Write-Host "✅ Containers started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Acesso:" -ForegroundColor Yellow
    Write-Host "   Frontend: http://localhost:8080" 
    Write-Host "   Backend:  http://localhost:3001" 
}

function Down-Containers {
    Write-Host "⏹️  Stopping containers..." -ForegroundColor Cyan
    docker-compose down
    Write-Host "✅ Containers stopped!" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📊 Showing logs..." -ForegroundColor Cyan
    docker-compose logs -f
}

function Clean-Docker {
    Write-Host "🧹 Cleaning Docker..." -ForegroundColor Cyan
    docker system prune -f
    Write-Host "✅ Docker cleaned!" -ForegroundColor Green
}

function Rebuild-All {
    Write-Host "🔄 Rebuilding everything..." -ForegroundColor Cyan
    Down-Containers
    Clean-Docker
    Build-Images
    Up-Containers
}

function Show-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose ps
}

function Shell-Backend {
    Write-Host "🔓 Entering backend container shell..." -ForegroundColor Cyan
    docker exec -it vale-church-manager-backend-1 /bin/sh
}

function Shell-Frontend {
    Write-Host "🔓 Entering frontend container shell..." -ForegroundColor Cyan
    docker exec -it vale-church-manager-frontend-1 /bin/sh
}

# Executar comando
switch ($Command.ToLower()) {
    "build" { Build-Images }
    "up" { Up-Containers }
    "down" { Down-Containers }
    "logs" { Show-Logs }
    "clean" { Clean-Docker }
    "rebuild" { Rebuild-All }
    "status" { Show-Status }
    "shell-backend" { Shell-Backend }
    "shell-frontend" { Shell-Frontend }
    default { Show-Help }
}
