#!/usr/bin/env pwsh
<#
🚀 SINCRONIZAR BACKEND VIA SSH - HOSTGATOR
Credenciais pré-configuradas:
  Usuário: contato
  Host: 69.6.212.241
  Senha: (será solicitada na terminal)
#>

# ===== CONFIGURAÇÃO =====
$sshUser = "contato"
$sshHost = "69.6.212.241"
$remoteDir = "/home/contato/app-backend"

# Cores
$Success = 'Green'
$Error = 'Red'
$Info = 'Cyan'
$Warning = 'Yellow'

Write-Host "`n════════════════════════════════════════" -ForegroundColor $Info
Write-Host "🚀 SINCRONIZAR BACKEND VIA SSH" -ForegroundColor $Info
Write-Host "════════════════════════════════════════`n" -ForegroundColor $Info

Write-Host "📡 Conexão:" -ForegroundColor $Warning
Write-Host "  Servidor: $sshHost" -ForegroundColor $Warning
Write-Host "  Usuário: $sshUser" -ForegroundColor $Warning
Write-Host "  Pasta remota: $remoteDir`n" -ForegroundColor $Warning

# ===== VERIFICAR ARQUIVOS LOCAIS =====
Write-Host "📁 Verificando arquivos locais..." -ForegroundColor $Info

$files = @("server.js", "package.json", ".env.production")
$allExist = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length / 1KB
        Write-Host "  ✓ $file ($([math]::Round($size, 2)) KB)" -ForegroundColor $Success
    } else {
        Write-Host "  ✗ $file (FALTANDO!)" -ForegroundColor $Error
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host "`n❌ Alguns arquivos estão faltando!" -ForegroundColor $Error
    exit 1
}

# ===== TESTE DE CONEXÃO SSH =====
Write-Host "`n🔗 Testando conexão SSH..." -ForegroundColor $Info

try {
    $testCmd = ssh -n "${sshUser}@${sshHost}" "echo OK" 2>&1
    if ($testCmd -eq "OK") {
        Write-Host "  ✓ Conexão SSH OK" -ForegroundColor $Success
    }
} catch {
    Write-Host "  ⚠️ Aviso ao testar SSH: $_" -ForegroundColor $Warning
}

# ===== CRIAR DIRETÓRIO REMOTO =====
Write-Host "`n📂 Criando diretório remoto..." -ForegroundColor $Info

try {
    ssh "${sshUser}@${sshHost}" "mkdir -p $remoteDir && echo Diretório criado"
    Write-Host "  ✓ Diretório criado/verificado" -ForegroundColor $Success
} catch {
    Write-Host "  ⚠️ Erro: $_" -ForegroundColor $Warning
}

# ===== ENVIAR ARQUIVOS VIA SCP =====
Write-Host "`n📤 Enviando arquivos..." -ForegroundColor $Info

try {
    $files | ForEach-Object {
        $sourceFile = $_
        $targetFile = $_ -replace "\.env\.production", ".env"
        
        Write-Host "  Enviando $sourceFile..." -ForegroundColor $Info
        scp -B $sourceFile "${sshUser}@${sshHost}:${remoteDir}/$targetFile" | Out-Null
        Write-Host "    ✓ $targetFile" -ForegroundColor $Success
    }
    
    Write-Host "`n✅ Todos os arquivos enviados!" -ForegroundColor $Success
} catch {
    Write-Host "`n❌ Erro ao enviar: $_" -ForegroundColor $Error
    exit 1
}

# ===== INSTALAR DEPENDÊNCIAS =====
Write-Host "`n🔧 Instalando dependências..." -ForegroundColor $Info

$setupScript = @"
cd $remoteDir

echo '📥 Instalando npm packages...'
npm install --production

echo '📦 Instalando PM2...'
npm install -g pm2 2>&1 | grep -v 'npm WARN'

echo '🚀 Iniciando servidor...'
pm2 start server.js --name "church-api"

echo '⚙️ Configurando auto-start...'
pm2 startup > /dev/null 2>&1
pm2 save > /dev/null 2>&1

echo '✅ Setup completo!'
pm2 status
"@

try {
    $setupScript | ssh "${sshUser}@${sshHost}" "bash -s"
    Write-Host "  ✓ Setup concluído" -ForegroundColor $Success
} catch {
    Write-Host "  ⚠️ Erro durante setup: $_" -ForegroundColor $Warning
}

# ===== TESTAR SERVIDOR =====
Write-Host "`n🧪 Testando servidor..." -ForegroundColor $Info

try {
    $healthResult = ssh "${sshUser}@${sshHost}" "curl -s http://localhost:3001/health"
    if ($healthResult -match "ok") {
        Write-Host "  ✓ Servidor respondendo corretamente" -ForegroundColor $Success
        Write-Host "    Resposta: $healthResult" -ForegroundColor $Success
    } else {
        Write-Host "  ⚠️ Resposta inesperada: $healthResult" -ForegroundColor $Warning
    }
} catch {
    Write-Host "  ⚠️ Não consegue testar: $_" -ForegroundColor $Warning
}

# ===== VER LOGS =====
Write-Host "`n📊 Status do PM2:" -ForegroundColor $Info

try {
    $pmStatus = ssh "${sshUser}@${sshHost}" "pm2 status"
    Write-Host $pmStatus -ForegroundColor $Success
} catch {
    Write-Host "  ⚠️ Erro ao verificar status" -ForegroundColor $Warning
}

# ===== RESULTADO FINAL =====
Write-Host "`n════════════════════════════════════════" -ForegroundColor $Success
Write-Host "🎉 SINCRONIZAÇÃO CONCLUÍDA!" -ForegroundColor $Success
Write-Host "════════════════════════════════════════`n" -ForegroundColor $Success

Write-Host "✅ Backend rodando em:" -ForegroundColor $Success
Write-Host "   http://$sshHost:3001" -ForegroundColor $Success
Write-Host "   http://$sshHost:3001/health`n" -ForegroundColor $Success

Write-Host "📝 Próximos passos:" -ForegroundColor $Info
Write-Host "   1. Testar site: http://seu_dominio.com" -ForegroundColor $Warning
Write-Host "   2. Tentar se inscrever em um evento" -ForegroundColor $Warning
Write-Host "   3. Se erro CORS/Mixed Content, contactar suporte`n" -ForegroundColor $Warning

Write-Host "🔗 Comandos úteis (SSH):" -ForegroundColor $Info
Write-Host "   Ver logs: ssh $sshUser@$sshHost 'pm2 logs church-api'" -ForegroundColor $Warning
Write-Host "   Reiniciar: ssh $sshUser@$sshHost 'pm2 restart church-api'" -ForegroundColor $Warning
Write-Host "   Parar: ssh $sshUser@$sshHost 'pm2 stop church-api'" -ForegroundColor $Warning
