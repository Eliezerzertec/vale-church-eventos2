#!/usr/bin/env pwsh
# 🚀 SINCRONIZAR BACKEND VIA SSH PARA HOSTGATOR

# ===== CONFIGURAÇÃO =====
$sshUser = "contato"           # Mudar para seu usuário FTP
$sshHost = "69.6.212.241"           # IP ou domínio do Hostgator
$sshPassword = "sua_senha"          # Mudar para sua senha
$remoteDir = "/home/$sshUser/app-backend"

# Cores
$Success = 'Green'
$Error = 'Red'
$Info = 'Cyan'
$Warning = 'Yellow'

Write-Host "`n🚀 SINCRONIZAR BACKEND VIA SSH - HOSTGATOR`n" -ForegroundColor $Info
Write-Host "Servidor: $sshHost" -ForegroundColor $Warning
Write-Host "Usuário: $sshUser" -ForegroundColor $Warning
Write-Host "Pasta remota: $remoteDir`n" -ForegroundColor $Warning

# ===== VERIFICAR ARQUIVOS LOCAIS =====
Write-Host "📁 Verificando arquivos locais..." -ForegroundColor $Info

$files = @("server.js", "package.json", ".env.production")
$allExist = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor $Success
    } else {
        Write-Host "  ✗ $file (FALTANDO!)" -ForegroundColor $Error
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host "`n❌ Alguns arquivos estão faltando!" -ForegroundColor $Error
    exit 1
}

# ===== ENVIAR ARQUIVOS VIA SCP =====
Write-Host "`n📤 Enviando arquivos para servidor..." -ForegroundColor $Info

# Instalar PuTTY se necessário (para ter scp)
# Para Windows, usar ssh.exe do Git Bash ou WSL

$sshCmd = @"
    scp -r server.js $sshUser@$sshHost:$remoteDir/
    scp -r package.json $sshUser@$sshHost:$remoteDir/
    scp -r .env.production $sshUser@$sshHost:$remoteDir/.env
"@

try {
    # Verificar se SSH está disponível
    $sshVersion = ssh -V 2>&1
    Write-Host "  SSH disponível: $sshVersion" -ForegroundColor $Success
    
    # Criar diretório remoto
    Write-Host "  Criando pasta remota..." -ForegroundColor $Info
    $createDir = "mkdir -p $remoteDir"
    
    # Enviar arquivo por arquivo
    Write-Host "  Enviando server.js..." -ForegroundColor $Info
    scp -B server.js "${sshUser}@${sshHost}:${remoteDir}/"
    
    Write-Host "  Enviando package.json..." -ForegroundColor $Info
    scp -B package.json "${sshUser}@${sshHost}:${remoteDir}/"
    
    Write-Host "  Enviando .env..." -ForegroundColor $Info
    scp -B .env.production "${sshUser}@${sshHost}:${remoteDir}/.env"
    
    Write-Host "`n✅ Arquivos enviados com sucesso!" -ForegroundColor $Success
    
} catch {
    Write-Host "`n❌ Erro ao enviar arquivos: $_" -ForegroundColor $Error
    Write-Host "`nAlternativa: Use File Manager do cPanel para upload manual" -ForegroundColor $Warning
    exit 1
}

# ===== EXECUTAR COMANDOS NO SERVIDOR =====
Write-Host "`n🔧 Instalando dependências no servidor..." -ForegroundColor $Info

$setupCommands = @"
cd $remoteDir
npm install --production
npm install -g pm2
pm2 start server.js --name "church-api"
pm2 startup
pm2 save
pm2 status
"@

try {
    # Executar via SSH
    $setupCommands | ssh -l $sshUser $sshHost
    
    Write-Host "`n✅ Setup concluído no servidor!" -ForegroundColor $Success
    
} catch {
    Write-Host "`n⚠️ Erro ao executar comandos: $_" -ForegroundColor $Warning
}

# ===== TESTAR SERVIDOR =====
Write-Host "`n🧪 Testando servidor..." -ForegroundColor $Info

$testCmd = "curl http://localhost:3001/health"

try {
    ssh -l $sshUser $sshHost $testCmd
    Write-Host "`n✅ Servidor respondendo!" -ForegroundColor $Success
    
} catch {
    Write-Host "`n⚠️ Não consegue testar remotamente" -ForegroundColor $Warning
}

# ===== RESULTADO =====
Write-Host "`n🎉 SINCRONIZAÇÃO CONCLUÍDA!`n" -ForegroundColor $Success
Write-Host "Backend rodando em:" -ForegroundColor $Info
Write-Host "  http://$sshHost:3001" -ForegroundColor $Success
Write-Host "  http://$sshHost:3001/health`n" -ForegroundColor $Success

Write-Host "Próximos passos:" -ForegroundColor $Info
Write-Host "  1. Verificar via navegador: http://$sshHost:3001/health" -ForegroundColor $Warning
Write-Host "  2. Frontend consegue chamar API" -ForegroundColor $Warning
Write-Host "  3. Se erro Mixed Content: mudar URL para HTTPS" -ForegroundColor $Warning
