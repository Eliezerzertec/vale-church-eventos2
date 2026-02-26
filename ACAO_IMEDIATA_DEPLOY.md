# 🎯 Ações Imediatas - Próximos 15 minutos

**Status:** Fases 1-4 Prontas para Deploy  
**Tempo Estimado:** 15 minutos (deploy + testes)  

---

## ✅ Step 1: Executar Script SQL (2 min)

### Abra Supabase Dashboard
```
https://app.supabase.com
→ Seu projeto
→ SQL Editor
```

### Cole o Conteúdo
**Arquivo:** `SCRIPT_CRIAR_WEBHOOK_TABLES.sql`

```sql
-- Copie TODO o conteúdo deste arquivo
```

### Execute
```
Clique: "Run"
```

### Verifique
```sql
SELECT COUNT(*) FROM webhook_events;  -- Deve retornar 0
SELECT COUNT(*) FROM webhook_billing_map;  -- Deve retornar 0
```

**Status:** ✅ Tabelas Criadas

---

## ✅ Step 2: Deploy Webhook (3 min)

### Abra Terminal no VS Code

```bash
# Navegue para workspace
cd "d:\DESENVOLVIMENTO APP WEB\Nova pasta\Eventos-Church-Lavras\vale-church-manager"

# Deploy a função
supabase functions deploy abacatepay-webhook
```

### Verifique Deployment
```bash
# Ver logs em tempo real
supabase functions logs abacatepay-webhook --limit=50

# Esperado: Sem erros de TypeScript
```

**Status:** ✅ Webhook Deployed

---

## ✅ Step 3: Teste Webhook (10 min)

### Teste 1: Validação de Secret ❌
```bash
# Terminal PowerShell
$body = @{
    id = "log_test_invalid_secret"
    event = "billing.paid"
    devMode = $true
    data = @{ amount = 1000 }
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-Webhook-Secret" = "wrong_secret_123"
}

Invoke-WebRequest `
    -Uri "https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -UseBasicParsing
```

**Esperado:** `401 Unauthorized`

---

### Teste 2: Secret Correto + DevMode ✅
```bash
$body = @{
    id = "log_test_devmode_123"
    event = "billing.paid"
    devMode = $true
    data = @{
        billing = @{
            id = "bill_12345"
            status = "paid"
        }
        payment = @{
            method = "PIX"
        }
    }
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-Webhook-Secret" = "qwe123123"
}

Invoke-WebRequest `
    -Uri "https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -UseBasicParsing
```

**Esperado:** `200 OK`

**Verifique logs:**
```bash
supabase functions logs abacatepay-webhook --limit=20

# Procure por:
# ✅ Webhook autenticado com sucesso
# 📨 [Fase 1] Webhook recebido
# ℹ️ Webhook de DESENVOLVIMENTO (teste)
# (Se em produção: ⏭️  Ignorando evento)
```

---

### Teste 3: Idempotência (Mesma 2x)
```bash
# Execute o Teste 2 novamente, EXATAMENTE igual

# Segunda execução esperada:
# ⏭️  Webhook log_test_devmode_123 já foi processado (status: processed)
# 200 OK
```

**Verifique no Supabase:**
```sql
SELECT id, event, status FROM webhook_events 
ORDER BY processed_at DESC 
LIMIT 5;

-- Esperado:
-- id                      | event       | status
-- log_test_devmode_123    | billing.paid| processed
-- (Apenas 1 entrada, não 2!)
```

**Status:** ✅ Idempotência Funcionando

---

### Teste 4: Webhook Real AbacatePay (Opcional)
```
AbacatePay Dashboard (https://dashboard.abacatepay.com)
→ Webhooks
→ [Seu webhook configurado]
→ Clique: "Testar" ou "Send Test Webhook"
```

**Esperado:**
```
✅ [WEBHOOK_RESPONSE]
Status: 200
Response: { "ok": true, "message": "...", "webhookId": "log_..." }
```

**Nos logs Supabase:**
```
✅ Webhook autenticado com sucesso
✅ Assinatura HMAC validada com sucesso (se configurado)
✅ [Fase 1] Webhook recebido
✅ Webhook processado
```

---

## 📊 Resultado Esperado Após Testes

| Teste | Esperado | ✅ Status |
|---|---|---|
| Secret inválido | 401 Unavailable | [ ] |
| Secret válido | 200 OK | [ ] |
| Idempotência | Processado 1x | [ ] |
| DevMode prod | Ignorado | [ ] |
| Logs enviados | Tabela webhook_events | [ ] |

---

## 🔍 Debug Se Algo Falhar

### "404 Not Found"
```bash
# Verifique URL está correta
# https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
#                      ^ supabase URL exato
```

### "500 Internal Server Error"
```bash
supabase functions logs abacatepay-webhook --limit=50
# Procur por erro específico na saída
```

### "Tabela não existe"
```bash
# Voltar para Step 1 e executar SQL script
```

### Não vê logs
```bash
# Verifique se function está realmente deployed
supabase functions list

# Se não estiver, execute novamente:
supabase functions deploy abacatepay-webhook
```

---

## ✅ Checklist de Conclusão

- [ ] Script SQL executado com sucesso
- [ ] Webhook deployed com sucesso
- [ ] Teste 1 retornou 401 (secret inválido)
- [ ] Teste 2 retornou 200 (secret correto)
- [ ] Teste 3: Idempotência funciona (processado 1x apenas)
- [ ] Banco webhook_events tem registros
- [ ] Logs mostram "[Fase 1] Webhook recebido"

---

## 🎯 Próximo Passo

Depois que todos os testes acima passarem ✅:

1. **Fazer pagamento real** no app (http://localhost:8081)
2. **Verificar** webhook foi processado (sem duplicata)
3. **Confirmar** registration status = "confirmed"
4. **Validar** idempotência com webhook duplicado

---

## 📞 Se Precisar de Ajuda

1. Verifique `IMPLEMENTACAO_STATUS.md` - Troubleshooting
2. Veja logs: `supabase functions logs abacatepay-webhook`
3. Abre `ROADMAP_IMPLEMENTACAO_OFICIAL.md` - Fase 5

---

**Tempo Total Estimado:** 15 minutos ⏱️  
**Resultado:** Webhook 100% funcional com Fases 1-4 ✅

🚀 Bora começar?
