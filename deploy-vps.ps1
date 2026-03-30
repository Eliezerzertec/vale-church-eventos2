#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Deploy completo para VPS LocalWeb (191.252.219.41)
  - Envia backend via SCP
  - Faz build do frontend
  - Envia frontend via SCP
  - Reinicia PM2 no servidor

.USAGE
  .\deploy-vps.ps1               # Deploy completo (backend + frontend)
  .\deploy-vps.ps1 -OnlyBackend  # Somente backend
  .\deploy-vps.ps1 -OnlyFrontend # Somente frontend
#>

param(
  [switch]$OnlyBackend,
  [switch]$OnlyFrontend
)

# ===== CONFIGURAÇÃO =====
$VPS_IP      = "191.252.219.41"
$SITE_HOST   = "vps65539.publiccloud.com.br"
$VPS_USER    = "root"                            # Altere se necessário
$REMOTE_DIR  = "/var/www/vale-church-manager"
$REMOTE_WWW  = "/var/www/html"
$PM2_APP     = "vale-church-backend"

# Cores
$Green  = 'Green'
$Red    = 'Red'
$Cyan   = 'Cyan'
$Yellow = 'Yellow'

function Write-Step($msg) { Write-Host "`n➡  $msg" -ForegroundColor $Cyan }
function Write-OK($msg)   { Write-Host "   ✓ $msg" -ForegroundColor $Green }
function Write-Err($msg)  { Write-Host "   ✗ $msg" -ForegroundColor $Red }

Write-Host "`n════════════════════════════════════════" -ForegroundColor $Cyan
Write-Host "   DEPLOY VPS LocalWeb — 191.252.219.41  " -ForegroundColor $Cyan
Write-Host "════════════════════════════════════════`n" -ForegroundColor $Cyan

Write-Host "  Destino: $VPS_USER@$VPS_IP" -ForegroundColor $Yellow
Write-Host "  Backend: $REMOTE_DIR" -ForegroundColor $Yellow
Write-Host "  Frontend: $REMOTE_WWW`n" -ForegroundColor $Yellow

# ===== VALIDAR SSH =====
Write-Step "Validando conexão SSH..."
try {
    $test = ssh -o "StrictHostKeyChecking=accept-new" -o "ConnectTimeout=10" `
        "${VPS_USER}@${VPS_IP}" "echo CONEXAO_OK" 2>&1
    if ($test -match "CONEXAO_OK") {
        Write-OK "SSH conectado com sucesso"
    } else {
        Write-Err "Falha na conexão SSH: $test"
        exit 1
    }
} catch {
    Write-Err "Erro SSH: $_"
    exit 1
}

# ===== DEPLOY BACKEND =====
if (-not $OnlyFrontend) {
    Write-Step "Preparando diretório remoto do backend..."
    ssh "${VPS_USER}@${VPS_IP}" "mkdir -p $REMOTE_DIR"
    Write-OK "Diretório $REMOTE_DIR criado/verificado"

    Write-Step "Enviando arquivos do backend..."

    $backendFiles = @(
        "server.js",
        "package.json",
        "ecosystem.config.cjs"
    )

    foreach ($f in $backendFiles) {
        if (Test-Path $f) {
            scp -q $f "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/"
            Write-OK "$f enviado"
        } else {
            Write-Err "$f não encontrado — pulando"
        }
    }

    # Envia .env.production como .env no servidor
    if (Test-Path ".env.production") {
        scp -q ".env.production" "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/.env"
        Write-OK ".env.production → .env enviado"
    } else {
        Write-Err ".env.production não encontrado!"
        exit 1
    }

    Write-Step "Instalando dependências no servidor..."
    ssh "${VPS_USER}@${VPS_IP}" @"
cd $REMOTE_DIR
npm install --omit=dev --silent 2>&1 | tail -5
echo DEPS_OK
"@

    Write-Step "Reiniciando PM2..."
    ssh "${VPS_USER}@${VPS_IP}" @"
cd $REMOTE_DIR

# Verificar se PM2 existe, instalar se não
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Parar processo anterior se existir
pm2 stop $PM2_APP 2>/dev/null || true
pm2 delete $PM2_APP 2>/dev/null || true

# Iniciar com ecosystem
pm2 start ecosystem.config.cjs
pm2 save

echo PM2_OK
"@

    Write-Step "Verificando health check do backend..."
    Start-Sleep -Seconds 3
    try {
        $health = Invoke-RestMethod -Uri "http://${VPS_IP}:3001/health" -Method GET -TimeoutSec 10
        Write-OK "Backend respondendo: $($health.status) | APIKey: $($health.apiKey)"
    } catch {
        Write-Host "   ⚠  Health check falhou (pode demorar mais alguns segundos)" -ForegroundColor $Yellow
        Write-Host "      Verifique: curl http://${VPS_IP}:3001/health" -ForegroundColor $Yellow
    }
}

# ===== DEPLOY FRONTEND =====
if (-not $OnlyBackend) {
    Write-Step "Fazendo build do frontend (modo production)..."

    if (-not (Test-Path "package.json")) {
        Write-Err "package.json não encontrado. Execute na raiz do projeto."
        exit 1
    }

    npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Build falhou! Verifique os erros acima."
        exit 1
    }
    Write-OK "Build concluído → pasta dist/"

    Write-Step "Enviando frontend para $REMOTE_WWW..."
    ssh "${VPS_USER}@${VPS_IP}" "mkdir -p $REMOTE_WWW"
    scp -r dist/* "${VPS_USER}@${VPS_IP}:${REMOTE_WWW}/"
    Write-OK "Frontend enviado"
}

# ===== RESUMO FINAL =====
Write-Host "`n════════════════════════════════════════" -ForegroundColor $Green
Write-Host "   ✅ DEPLOY CONCLUÍDO!                  " -ForegroundColor $Green
Write-Host "════════════════════════════════════════" -ForegroundColor $Green
Write-Host ""
Write-Host "  Frontend: http://$SITE_HOST" -ForegroundColor $Yellow
Write-Host "  Backend:  http://$SITE_HOST:3001/health" -ForegroundColor $Yellow
Write-Host "  Webhook:  http://$SITE_HOST:3001/api/webhook/abacatepay" -ForegroundColor $Yellow
Write-Host ""
Write-Host "  Logs PM2: ssh ${VPS_USER}@${VPS_IP} 'pm2 logs $PM2_APP'" -ForegroundColor $Cyan
Write-Host ""
