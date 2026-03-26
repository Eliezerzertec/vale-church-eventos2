# Script para Preparar Upload no Hostgator
# Compacta a pasta dist em ZIP pronto para upload

Write-Host "[UPLOAD] Preparando site para upload no Hostgator..." -ForegroundColor Cyan
Write-Host ""

# Verificar se pasta dist existe
if (-not (Test-Path "dist")) {
    Write-Host "[ERRO] Pasta 'dist' nao encontrada!" -ForegroundColor Red
    Write-Host "   Execute primeiro: npm run build" -ForegroundColor Yellow
    exit 1
}

# Obter informacoes da pasta
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
$distSizeMB = [math]::Round($distSize / 1MB, 2)
$fileCount = (Get-ChildItem -Path "dist" -Recurse).Count

Write-Host "[INFO] Informacoes da Build:" -ForegroundColor Green
Write-Host "   Tamanho: $distSizeMB MB"
Write-Host "   Arquivos: $fileCount"
Write-Host ""

# Criar ZIP
Write-Host "[INFO] Compactando arquivos..." -ForegroundColor Cyan
if (Test-Path "dist.zip") {
    Remove-Item "dist.zip" -Force
    Write-Host "   (removido ZIP antigo)"
}

Compress-Archive -Path "dist\*" -DestinationPath "dist.zip" -Force

# Verificar se criou ZIP
if (Test-Path "dist.zip") {
    $zipSize = (Get-Item "dist.zip").Length
    $zipSizeMB = [math]::Round($zipSize / 1MB, 2)
    Write-Host "[OK] ZIP criado com sucesso!" -ForegroundColor Green
    Write-Host "   Arquivo: dist.zip"
    Write-Host "   Tamanho: $zipSizeMB MB"
    Write-Host ""
} else {
    Write-Host "[ERRO] Erro ao criar ZIP!" -ForegroundColor Red
    exit 1
}

Write-Host "[PROXIMAS ETAPAS]" -ForegroundColor Yellow
Write-Host "   1. Abra seu Gerenciador de Arquivos do Hostgator"
Write-Host "   2. Navegue para: /home/seu_usuario/public_html/"
Write-Host "   3. Faca upload do arquivo: dist.zip"
Write-Host "   4. Descompacte o arquivo no servidor"
Write-Host "   5. Delete o arquivo dist.zip do servidor"
Write-Host "   6. Seu site estara em: https://seu-dominio.com.br"
Write-Host ""

Write-Host "[DICA] Alternativamente, use FileZilla ou WinSCP:" -ForegroundColor Cyan
Write-Host "   Consulte: GUIA_HOSTGATOR_UPLOAD.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "[CONCLUIDO] Site pronto para upload!" -ForegroundColor Green
