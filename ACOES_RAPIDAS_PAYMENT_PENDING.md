# ⚡ Ações Rápidas: Página Fica em "Pagamento Pendente"

## 🚨 Se Pages Fica "Carregando", Tente ISTO

## Ação 1: Monitorar Webhook (Primeiro!)

```bash
npm run monitor:webhooks
```

**Faz pagamento novamente e procure:**
```
✅ billing.paid aparecer nos logs
```

**Se não aparecer:** Webhook não disparou (ir para "Solução 1" abaixo)

**Se aparece ✅:** Webhook funcionando (ir para "Solução 2")

---

## Ação 2: Forçar Refresh Manual

Clique em: **"Verificar Agora"** na página

Ou pressione: **F5** (reload)

**Se atualizar para ✅ Pago:** PRONTO!

**Se ainda em ⏳ Pendente:** Continue abaixo

---

## Ação 3: Verificar Banco de Dados

Abra: **Supabase → SQL Editor**

```sql
SELECT * FROM payments 
ORDER BY created_at DESC 
LIMIT 1;
```

**Procure por:**
- `status = 'paid'` (OK!)
- `status = 'pending'` (Webhook não atualizou)
- Row não existe (Payment não foi criado)

**Se status = 'paid':** Atualizar página (F5)

**Se status = 'pending':** Webhook falhou (mudar para "paid" manualmente)

**Se não existe:** Erro ao criar pagamento

---

## Soluções Rápidas

### Solução 1: Webhook Não Disparou

**Causa:** Edge Function não está ativa

**Ação:**
1. Ir: Supabase → Functions → abacatepay-webhook
2. Deve estar verde (deployed)
3. Se vermelho (erro), clicar para ver detalhes
4. Tentar pagar novamente

### Solução 2: Webhook Disparou Mas Banco Não Atualizou

**Causa:** RLS policy bloqueando ou erro no código

**Ação:**
1. Ver webhook logs: `npm run monitor:webhooks`
2. Se vir ❌ 400/500, há erro na resposta
3. Executar manualmente:

```sql
-- Supabase SQL Editor
UPDATE payments 
SET status = 'paid' 
WHERE billing_id = 'bill_XXXXX';

UPDATE event_registrations 
SET status = 'confirmed' 
WHERE id = 'REG_ID';
```

4. Atualizar página

### Solução 3: Tabela webhook_logs Não Existe

**Ação:**
1. Supabase → SQL Editor
2. Copiar `MIGRAÇÃO_6_WEBHOOK_LOGS.sql`
3. Colar no editor e executar

---

## ✅ Checklist 30 segundos

- [ ] `npm run monitor:webhooks` rodando?
- [ ] Webhook ✅ apareceu nos logs?
- [ ] Clicou "Verificar Agora"?
- [ ] Verificou banco com SQL?
- [ ] Status = "paid" ou "pending"?

---

## Links Rápidos

| O que fazer | Link |
|-----------|------|
| Ver webhook real-time | `npm run monitor:webhooks` |
| Ver logs webhook | http://localhost:3001/api/webhook/logs |
| Acessar banco | https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql |
| Ver function logs | https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/functions/abacatepay-webhook/logs |

---

## 🎯 Se Nada Funcionar

**Reset completo e tenta novamente:**

```sql
-- Supabase SQL Editor

-- 1. Find IDs
SELECT id as reg_id FROM event_registrations 
ORDER BY created_at DESC LIMIT 1;

SELECT registration_id FROM payments 
ORDER BY created_at DESC LIMIT 1;

-- 2. Delete
DELETE FROM payments WHERE registration_id = 'REG_ID';
UPDATE event_registrations SET status = 'cancelled' WHERE id = 'REG_ID';

-- 3. Tenta nova inscrição
```

Depois tenta pagamento novo.

---

**Status:** 🔧 Troubleshooting
**Última atualização:** 23/02/2025
