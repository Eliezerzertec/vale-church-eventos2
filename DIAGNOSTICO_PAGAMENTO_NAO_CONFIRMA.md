# 🔍 DIAGNÓSTICO: Por Que Pagamento Não Confirma

## Checklist Rápido
- [ ] **Passo 1**: Webhook está sendo recebido?
- [ ] **Passo 2**: Secret está correto?
- [ ] **Passo 3**: Tabela `payments` foi criada com `billing_id`?
- [ ] **Passo 4**: `billing_id` está sendo salvo corretamente?
- [ ] **Passo 5**: RLS não está bloqueando?

---

## 🔎 PASSO 1: Verificar se Webhook está Sendo Recebido

### 1a. Monitorar em Tempo Real
```bash
npm run monitor:webhooks
```

**O que procurar:**
```
✅ Webhook recebido: billing.paid → billing_id=ABC123
```

Se nenhum webhook aparecer → **Problema está em AbacatePay**

### 1b. Verificar Logs no Supabase
Abra o painel Supabase → **Functions** → **abacatepay-webhook** → **Recent Invocations**

**Procure por:**
- ✅ Green (200) = Webhook recebido e processado
- ❌ Red (401, 404, 500) = Erro no processamento

---

## 🔑 PASSO 2: Validar Secret do Webhook

### 2a. Configuração Atual
```
✅ Secret configurado CORRETAMENTE em código:
   ABACATEPAY_WEBHOOK_SECRET=qwe123123
```

### 2b. No Dashboard do AbacatePay
1. Ir para **Webhooks**
2. Procurar por: `https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook`
3. Verificar se a Chave Secreta está exatamente como: `qwe123123`

❌ Se for diferente → **Atualizar no AbacatePay**

---

## 💾 PASSO 3: Tabela `payments` Existe?

### Execute esta Query (SQL do Supabase):
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;
```

**Esperado:**
- ✅ `billing_id` (TEXT)
- ✅ `transaction_id` (TEXT)
- ✅ `status` (TEXT default: 'pending')
- ✅ `registration_id` (UUID)
- ✅ `updated_at` (TIMESTAMPTZ)

❌ Se `billing_id` não existe → **Execute a migração**

---

## 🔗 PASSO 4: `billing_id` está Sendo Salvo?

### 4a. Verificar se foi Salvo Ao Criar Pagamento

No código em `EventDetailPage.tsx`, procure por:
```typescript
const response = await fetch("/api/payment/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    registration_id: registrationId,
    user_email: email,
    event_price: event.price,
    full_name: fullName,
    billing_id: billingResponse?.billing?.id,  // ← Está aqui?
  }),
});
```

❌ Se `billing_id` não for enviado → **Adicionar**

### 4b. Verificar no Backend (`server.js`)

Procure por:
```javascript
const { registration_id, billing_id, user_email, event_price } = req.body;

const { error } = await supabase
  .from("payments")
  .insert({
    registration_id,
    billing_id,  // ← Está aqui?
    status: "pending",
    created_at: new Date(),
  });
```

❌ Se `billing_id` não for salvo → **Adicionar**

### 4c. Verificar Dados Salvos

Execute no Supabase SQL:
```sql
SELECT id, registration_id, billing_id, status, created_at 
FROM payments 
ORDER BY created_at DESC 
LIMIT 5;
```

**Esperado:**
```
| id   | registration_id | billing_id         | status  | created_at        |
|------|-----------------|-------------------|---------|-------------------|
| abc  | xyz123          | ABCAE43221        | pending | 2026-02-23 14:30 |
```

❌ Se `billing_id` for NULL → **Problema está no servidor**

---

## 🔐 PASSO 5: RLS (Row Level Security) Bloqueando?

### Execute esta Query:
```sql
SELECT * 
FROM pg_catalog.pg_policies 
WHERE tablename = 'payments'
LIMIT 10;
```

**Se houver muitas policies:**

Acessar **Supabase Dashboard** → **Authentication** → **Policies**

Procurar por policies que bloqueiem:
- `INSERT` em `payments`
- `UPDATE` em `payments`

❌ Se houver policy restrictiva → **Desabilitar ou ajustar**

---

## 📊 RESUMO DO FLUXO

```
1. Usuário completa pagamento no AbacatePay
   ✓
2. AbacatePay redireciona para: /payment-confirmation/:id?registration_id=...&billing_id=...
   ✓
3. Página busca status em:
   a) Tabela payments (billing_id) → status = "paid" ou "pending"
   b) Tabela event_registrations (registration_id) → status = "confirmed" ou "pending"
   ✓ Determina: "paid" | "pending" | "failed"
   
4. Se "pending" → auto-refresh a cada 3-10s por até 30x
   
5. AbacatePay envia webhook → https://...supabase.../functions/v1/abacatepay-webhook
   ✓ Recebe: { event: "billing.paid", data: { billing: { id, status } } }
   ✓ Busca payment por billing_id
   ✓ Atualiza: payments.status = "paid"
   ✓ Atualiza: event_registrations.status = "confirmed"
   
6. Próxima vez que página recarrega → vê status "paid"
   ✓ Mostra: ✅ Pagamento Confirmado!
```

---

## 🎯 POSSÍVEIS PONTOS DE FALHA

| # | Ponto | Sintoma | Solução |
|---|-------|--------|---------|
| 1 | AbacatePay não envia webhook | Logs vazios por 5+ min | Verificar URL no painel AbacatePay |
| 2 | Secret inválido | "Webhook com secret inválido" nos logs | Confirmar `qwe123123` no AbacatePay |
| 3 | `billing_id` não salvo | Webhook recebido mas "Payment not found (404)" | Adicionar `billing_id` em `/api/payment/create` |
| 4 | RLS bloqueando | Middleware sem erro, mas DB não atualiza | Desabilitar RLS em `payments` |
| 5 | Tipo de dados | `billing_id` é número, deve ser TEXT | Confirmar coluna é TEXT |
| 6 | Duplicatas | Múltiplas inscrições com mesmo email | Index de duplicata existe? |

---

## 🚀 PRÓXIMOS PASSOS

### Se Webhook Não Aparece:
```bash
# 1. Monitorar em tempo real
npm run monitor:webhooks

# 2. Fazer pagamento de teste no AbacatePay
# (Usar PIX com valor reduzido se possível)

# 3. Observar logs
```

### Se Webhook Aparece com ❌:
```bash
# Abrir Supabase Dashboard → Functions → abacatepay-webhook
# Clicar em último invocation com erro
# Ler a mensagem de erro completa
```

### Se Tudo Aparece ✅ Mas Página Não Muda:
```sql
-- Verificar se status foi realmente atualizado
SELECT status, updated_at 
FROM payments 
WHERE billing_id = 'COLE_AQUI_O_BILLING_ID'
LIMIT 1;

-- Se status ainda é "pending"
-- → Webhook processou mas não atualizou
-- → Verificar RLS em tabela payments
```

---

## 📞 Quando Chamar Suporte

Se depois de seguir todos os passos ainda tiver problema:
1. Coletar: `billing_id` de um pagamento falho
2. Coletar: último erro dos logs do webhook
3. Coletar: resultado da query: `SELECT * FROM payments WHERE billing_id = 'ABC' LIMIT 1`
4. Coletar: resultado da query RLS (Passo 5)

Com essas informações, o debug fica 95% mais rápido! 🎯
