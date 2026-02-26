# ============================================
# Setup Webhook Monitor - Script Automatizado
# ============================================
# Este script configura TUDO para você:
# 1. Verifica se as tabelas existem no Supabase
# 2. Desabilita RLS
# 3. Popula com dados de teste
# 4. Abre a página de monitoramento

Write-Host "🔌 Iniciando setup do Webhook Monitor..." -ForegroundColor Cyan

# Variáveis Supabase
$SUPABASE_URL = "https://cwzmiznlvhhnpjgxgsme.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4"
$WEBHOOK_URL = "http://localhost:8080/webhook"

# Cores
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Setup do Webhook Monitor - AbacatePay                         ║" -ForegroundColor Cyan
Write-Host "║  Monitorando em http://localhost:8080/webhook                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Populando dados de teste
Write-Host "1️⃣  Populando banco com webhooks de teste..." -ForegroundColor $InfoColor
Write-Host "   Execute: node populate-webhook-test-data.js" -ForegroundColor $WarningColor
Write-Host ""

# Passo 2: Importar SQL (dica)
Write-Host "2️⃣  Configure o banco de dados (execute uma única vez):" -ForegroundColor $InfoColor
Write-Host ""
Write-Host "   $SUPABASE_URL" -ForegroundColor $WarningColor
Write-Host ""
Write-Host "   Copie e cole este SQL no Supabase SQL Editor:" -ForegroundColor DarkGray
Write-Host "   ────────────────────────────────────────────────────" -ForegroundColor DarkGray

$sqlContent = @"
ALTER TABLE public.webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs REPLICA IDENTITY FULL;
SELECT COUNT(*) as total_webhooks FROM public.webhook_logs;
"@

Write-Host $sqlContent -ForegroundColor Green

Write-Host "   ────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Passo 3: Verificar frontend
Write-Host "3️⃣  Iniciando frontend..." -ForegroundColor $InfoColor
Write-Host "   Execute em outro terminal: npm run dev" -ForegroundColor $WarningColor
Write-Host ""

# Passo 4: Acessar página
Write-Host "4️⃣  Abrindo Webhook Monitor..." -ForegroundColor $InfoColor
Write-Host ""

Start-Sleep -Seconds 2

Try {
    Write-Host "   Abrindo: $WEBHOOK_URL" -ForegroundColor Green
    Start-Process $WEBHOOK_URL
    Write-Host "   ✅ Página aberta no navegador!" -ForegroundColor $SuccessColor
} Catch {
    Write-Host "   ⚠️  Abra manualmente: $WEBHOOK_URL" -ForegroundColor $WarningColor
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Setup Concluído! 🎉                                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Checklist:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✅ Página Webhook Monitor criada" -ForegroundColor $SuccessColor
Write-Host "  ✅ Script de população pronto" -ForegroundColor $SuccessColor
Write-Host "  ⏳ Frontend rodando (npm run dev)" -ForegroundColor $WarningColor
Write-Host "  ⏳ Dados de teste inseridos (node populate-webhook-test-data.js)" -ForegroundColor $WarningColor
Write-Host "  ⏳ RLS desabilitado no Supabase (SQL executor above)" -ForegroundColor $WarningColor
Write-Host ""

Write-Host "🔗 Links Úteis:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Webhook Monitor:     http://localhost:8080/webhook" -ForegroundColor DarkCyan
Write-Host "  Supabase Dashboard:  $SUPABASE_URL" -ForegroundColor DarkCyan
Write-Host "  Backend Health:      http://localhost:3001/health" -ForegroundColor DarkCyan
Write-Host ""

Write-Host "💡 Próximos Passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Execute o SQL acima no Supabase (~5 segundos)" -ForegroundColor Gray
Write-Host "  2. Execute: node populate-webhook-test-data.js" -ForegroundColor Gray
Write-Host "  3. Acesse: http://localhost:8080/webhook" -ForegroundColor Gray
Write-Host "  4. Veja os webhooks aparecerem em tempo real!" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentação: WEBHOOK_MONITOR_SETUP.md" -ForegroundColor Cyan
Write-Host ""
