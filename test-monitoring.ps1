# Script para testar endpoints de monitoramento de transações API AbacatePay
# Uso: .\test-monitoring.ps1

$BASE_URL = "http://localhost:3001"

Write-Host "🔍 TESTANDO ENDPOINTS DE MONITORAMENTO API ABACATEPAY" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Últimas transações com erro
Write-Host "`n1️⃣  Últimas 10 transações COM ERRO:" -ForegroundColor Blue
Write-Host "GET $BASE_URL/api/monitor/transactions?limit=10&status=error`n" -ForegroundColor Gray
$response = Invoke-WebRequest -Uri "$BASE_URL/api/monitor/transactions?limit=10&status=error" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3 | Write-Host

# 2. Últimas transações bem-sucedidas
Write-Host "`n2️⃣  Últimas 10 transações BEM-SUCEDIDAS:" -ForegroundColor Blue
Write-Host "GET $BASE_URL/api/monitor/transactions?limit=10&status=success`n" -ForegroundColor Gray
$response = Invoke-WebRequest -Uri "$BASE_URL/api/monitor/transactions?limit=10&status=success" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3 | Write-Host

# 3. Estatísticas gerais
Write-Host "`n3️⃣  ESTATÍSTICAS GERAIS:" -ForegroundColor Blue
Write-Host "GET $BASE_URL/api/monitor/stats`n" -ForegroundColor Gray
$response = Invoke-WebRequest -Uri "$BASE_URL/api/monitor/stats" -Method Get
$stats = $response.Content | ConvertFrom-Json
Write-Host ($stats | ConvertTo-Json -Depth 5) -ForegroundColor White

# Resumo das estatísticas
if ($stats.data) {
    Write-Host "`n📊 RESUMO RÁPIDO:" -ForegroundColor Yellow
    Write-Host "   Total: $($stats.data.total)"
    Write-Host "   Sucesso: $($stats.data.success)"
    Write-Host "   Erros: $($stats.data.errors)"
    Write-Host "   Taxa de Sucesso: $($stats.data.successRate)"
    Write-Host "   Duração média: $($stats.data.averageDurationMs)ms"
}

# 4. Transações de um usuário
Write-Host "`n4️⃣  TRANSAÇÕES DE UM USUÁRIO ESPECÍFICO:" -ForegroundColor Blue
$email = "zertec.eliezer@hotmail.com"
Write-Host "GET $BASE_URL/api/monitor/user/$email`n" -ForegroundColor Gray
$response = Invoke-WebRequest -Uri "$BASE_URL/api/monitor/user/$email" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3 | Write-Host

# 5. Histórico de uma cobrança
Write-Host "`n5️⃣  HISTÓRICO DE UMA COBRANÇA ESPECÍFICA:" -ForegroundColor Blue
$billingId = "bill_S1GkTKyKZtc0aCKys1mBRQqB"
Write-Host "GET $BASE_URL/api/monitor/billing/$billingId`n" -ForegroundColor Gray
$response = Invoke-WebRequest -Uri "$BASE_URL/api/monitor/billing/$billingId" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3 | Write-Host

Write-Host "`n✅ Testes concluído!" -ForegroundColor Green

# Menu interativo (opcional)
Write-Host "`n" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
Write-Host "Deseja fazer uma consulta customizada?" -ForegroundColor Yellow
Write-Host "1) Buscar transação por ID" -ForegroundColor Gray
Write-Host "2) Buscar transações de um email" -ForegroundColor Gray
Write-Host "3) Buscar transações de uma cobrança" -ForegroundColor Gray
Write-Host "Q) Sair" -ForegroundColor Gray

$choice = Read-Host "Escolha uma opção"

switch ($choice) {
    "1" {
        $txnId = Read-Host "ID da transação (ex: txn_1708967426000_xyz)"
        Write-Host "`nBuscando $txnId..." -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/monitor/transaction/$txnId" -Method Get
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host
    }
    "2" {
        $email = Read-Host "Email do usuário"
        Write-Host "`nBuscando transações de $email..." -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/monitor/user/$email" -Method Get
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host
    }
    "3" {
        $billingId = Read-Host "ID da cobrança (ex: bill_xxxxx)"
        Write-Host "`nBuscando transações de $billingId..." -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/monitor/billing/$billingId" -Method Get
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host
    }
    "q" {
        Write-Host "Saindo..." -ForegroundColor Gray
        exit
    }
    default {
        Write-Host "Opção inválida" -ForegroundColor Red
    }
}
