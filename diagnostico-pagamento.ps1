#!/usr/bin/env pwsh

# ============================================
# Script de Diagnóstico: Pagamento Não Confirma
# ============================================
# Execute: .\diagnostico-pagamento.ps1

Write-Host "
╔═══════════════════════════════════════════════════════════════╗
║   🔍 DIAGNÓSTICO: Por Que Pagamento Não Confirma             ║
╚═══════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# ============================================
# 1. Verificar Monitoramento de Webhooks
# ============================================
Write-Host "`n[1/5] Iniciando Monitoramento de Webhooks..." -ForegroundColor Yellow
Write-Host "Aguardando 10 segundos por webhooks recentes...`n" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/webhook/logs" `
        -UseBasicParsing -ErrorAction Stop
    
    $logs = $response.Content | ConvertFrom-Json
    
    if ($logs -and $logs.Length -gt 0) {
        Write-Host "✅ Webhooks Recebidos (últimos 5):" -ForegroundColor Green
        
        $logs | Select-Object -First 5 | ForEach-Object {
            $status_color = if ($_.response_status -eq "200") { "Green" } else { "Red" }
            Write-Host "  • $($_.event) | billing_id: $($_.billing_id | Select-Object -First 20)... | Status: $($_.response_status)" -ForegroundColor $status_color
        }
        
        $errorCount = ($logs | Where-Object { $_.response_status -ne "200" } | Measure-Object).Count
        if ($errorCount -gt 0) {
            Write-Host "  ⚠️  $errorCount webhook(s) com erro!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Nenhum webhook recebido ainda!" -ForegroundColor Red
        Write-Host "   → Cause: AbacatePay pode não ter enviado" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend não está respondendo em http://localhost:3001" -ForegroundColor Red
    Write-Host "   → Execute: npm run dev:backend" -ForegroundColor Gray
}

# ============================================
# 2. Verificar se Tabela Payments Existe
# ============================================
Write-Host "`n[2/5] Verificando estrutura da tabela 'payments'..." -ForegroundColor Yellow

$checkQuery = @"
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;
"@

Write-Host "Query: $checkQuery`n" -ForegroundColor Gray

$criticalColumns = @("billing_id", "transaction_id", "registration_id", "status", "updated_at")
Write-Host "Colunas esperadas:" -ForegroundColor Cyan
$criticalColumns | ForEach-Object { Write-Host "  • $_" }

Write-Host "`n💡 Para verificar manualmente:" -ForegroundColor Cyan
Write-Host "   1. Abra: https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "   2. Execute a query acima na aba SQL" -ForegroundColor Gray
Write-Host "   3. Procure por: billing_id (TEXT)" -ForegroundColor Gray

# ============================================
# 3. Verificar Pagamentos Sem Status'paid'
# ============================================
Write-Host "`n[3/5] Verificando pagamentos recentes..." -ForegroundColor Yellow

$paymentsQuery = @"
SELECT 
    id, 
    registration_id, 
    billing_id, 
    status, 
    created_at 
FROM payments 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC 
LIMIT 10;
"@

Write-Host "Query para copiar no Supabase SQL:" -ForegroundColor Cyan
Write-Host $paymentsQuery -ForegroundColor Gray

Write-Host "`nO que procurar:" -ForegroundColor Cyan
Write-Host "  ✅ Se billing_id tem valor (não NULL)" -ForegroundColor Green
Write-Host "  ❌ Se status ainda é 'pending' após 5+ minutos" -ForegroundColor Red
Write-Host "  ❌ Se billing_id é NULL → problema em /api/payment/create" -ForegroundColor Red

# ============================================
# 4. Script de Test: Enviar Webhook Manual
# ============================================
Write-Host "`n[4/5] Script para testar webhook manualmente..." -ForegroundColor Yellow

$testWebhook = @"
# Execute isto em outro terminal PowerShell

`$billingId = "TEST-" + [datetime]::Now.ToString("yyyyMMdd-HHmmss")
`$payload = @{
    event = "billing.paid"
    data = @{
        billing = @{
            id = `$billingId
            status = "paid"
        }
    }
} | ConvertTo-Json

`$headers = @{
    "Content-Type" = "application/json"
    "X-Webhook-Secret" = "qwe123123"
}

Invoke-WebRequest -Uri "http://localhost:3001/abacatepay-webhook" `
    -Method POST `
    -Headers `$headers `
    -Body `$payload `
    -UseBasicParsing

Write-Host "✅ Webhook de teste enviado (billing_id: `$billingId)"
"@

Write-Host $testWebhook -ForegroundColor Green

# ============================================
# 5. Checklist de Configuração
# ============================================
Write-Host "`n[5/5] Checklist de Configuração" -ForegroundColor Yellow

$checklist = @(
    @{ item = "Backend rodando em http://localhost:3001"; cmd = "npm run dev:backend" },
    @{ item = "Frontend rodando em http://localhost:8081"; cmd = "npm run dev" },
    @{ item = "Secret no AbacatePay é 'qwe123123'"; cmd = "Verificar manualmente no AbacatePay" },
    @{ item = "Webhook URL correto"; cmd = "https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook" },
    @{ item = "RLS desabilitada em 'payments'"; cmd = "Verificar Supabase → Authentication → Policies" }
)

$checklist | ForEach-Object {
    Write-Host "  [ ] $($_.item)" -ForegroundColor Cyan
    Write-Host "      → $($_.cmd)" -ForegroundColor Gray
}

# ============================================
# Resumo
# ============================================
Write-Host "`
╔═══════════════════════════════════════════════════════════════╗
║   📋 Próximos Passos                                          ║
╚═══════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "
1️⃣  Você já monitorou os webhooks com monitor:webhooks? (npm run monitor:webhooks)
   → Procure por: ✅ Webhook recebido: billing.paid

2️⃣  Você testou uma transação real no AbacatePay?
   → Use um valor baixo (ex: R$ 1,00 com PIX)

3️⃣  Os logs do webhook mostram erros (❌)?
   → Abra: Supabase → Functions → abacatepay-webhook → Recent Invocations
   → Procure por invocações com status vermelho

4️⃣  Você verificou se billing_id foi salvo?
   → Execute a query no passo [3/5]
   → Procure por: billing_id NOT NULL

5️⃣  RLS pode estar bloqueando?
   → Ir: Supabase → Authentication → Policies
   → Procure por policies em 'payments'
   → Desabilitar se houver muitas

" -ForegroundColor Green

Write-Host "
Documentação completa em: DIAGNOSTICO_PAGAMENTO_NAO_CONFIRMA.md

" -ForegroundColor Gray
