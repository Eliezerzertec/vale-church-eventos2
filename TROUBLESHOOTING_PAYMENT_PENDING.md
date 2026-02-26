# 🐛 Troubleshooting: Página Fica em "Pagamento Pendente"

## ⚠️ O Problema

A página mostra "Pagamento Pendente" mas não muda para "Pagamento Confirmado" mesmo após completar o pagamento.

---

## 🔍 Causas Possíveis

### 1️⃣ Webhook Não Está Disparando

**Verificar:**
1. Abra: `npm run monitor:webhooks` em um terminal
2. Procure por novos eventos após fazer pagamento
3. Se não aparecer nada, webhook não foi acionado

**Solução:**
- Verificar webhook URL no AbacatePay: `https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook`
- Verificar webhook secret: `qwe123123`
- Verifique que Supabase Edge Function foi deployada

### 2️⃣ Webhook Disparando Mas Status Não Atualiza

**Verificar:**
1. Ver logs em `npm run monitor:webhooks`
2. Procurar por status HTTP
3. Se vir ❌ (status 400/500), há erro

**Solução:**
- Verificar erro_message nos logs
- Executar migração webhook_logs (se não fez)
- Confirmar RLS policies foram criadas

### 3️⃣ Webhook Encontrou Erro: "Payment Not Found"

**Significa:** `billing_id` não foi salvo corretamente na tabela orders

**Verificar:**
```sql
-- Supabase SQL Editor
SELECT billing_id, status FROM payments 
WHERE registration_id = 'REGISTRATION_ID_AQUI'
LIMIT 1;
```

**Se billing_id é NULL:**
- Problema na resposta do AbacatePay
- Verificar server.js `/api/payment/create`

**Se existe mas ainda erro:**
- RLS policy bloqueando webhook
- Verificar policies webhook_logs

### 4️⃣ Dados Foram Salvos Mas Page Não Atualiza

**Significa:** Página não está refazendo o fetch

**Verificar:**

Abra Console (F12) > Tab "Console":
```javascript
// Procure por logs como:
// ✅ Registration encontrado
// ✅ Payment encontrado
// 🔍 Status determinado: { ... }
```

Se não vir nada:
- Atualizar página manualmente
- Clicar "Verificar Agora"

---

## 🔧 Passo a Passo de Debug

### Passo 1: Verificar Webhook Chegou

```bash
# Terminal 1
npm run monitor:webhooks
```

**Fazer pagamento no app** e procure por:
```
📥 1 novo(s) evento(s) detectado(s):

1. ✅ [HH:MM:SS]
   Evento: billing.paid
   ID Cobrança: bill_xxx
   Status HTTP: 200
```

**Se vir ✅ 200**, webhook chegou corretamente


**Se vir ❌ 400/500**:
1. Clique para ver erro_message
2. Guia resolução abaixo

### Passo 2: Verificar Formato do Webhook

Se status HTTP = 400, pode ser erro de parsing:

```bash
# Para ver payload completo
curl http://localhost:3001/api/webhook/logs | jq '.data[0].request_body'
```

Procure por:
```json
{
  "event": "billing.paid",
  "data": {
    "billing": {
      "id": "bill_xxx",  // ← Deve existir
      "status": "paid"
    },
    "payment": {
      "method": "pix"
    }
  }
}
```

Se formato diferente, AbacatePay mudou API.

### Passo 3: Verificar Se Payment Foi Criado

```sql
-- Supabase SQL Editor
SELECT * FROM payments 
ORDER BY created_at DESC 
LIMIT 1;
```

Busque por billing_id que viu no webhook

**Se existe:**
- Status deve ser "paid"
- Método de pagamento deve estar preenchido

**Se não existe:**
- Webhook não conseguiu criar registro
- Verificar RLS policy em payments

### Passo 4: Verificar Se Registration Foi Confirmada

```sql
-- Supabase SQL Editor
SELECT * FROM event_registrations 
ORDER BY created_at DESC 
LIMIT 1;
```

**Status deve ser:**
- "confirmed" (após pagamento)
- "pending" (ainda não pago)

**Se ainda "pending":**
- Webhook não atualizou
- Atualizar registração manualmente no SQL

---

## ✅ Soluções Prontas

### Solução 1: Webhook Não Disparou

**Passo 1:** Verificar se Edge Function está deployada
```bash
# Em Supabase → Functions → abacatepay-webhook
# Deve estar verde (successfully deployed)
```

**Passo 2:** Redeploy da função
```bash
cd supabase/functions/abacatepay-webhook
# Editar alguma coisa (adicionar vazio)
# Supabase detecta mudança e faz redeploy
```

**Passo 3:** Reteste

### Solução 2: Webhook Dispara Mas Status Fica Pendente

**Passo 1:** Atualizar manualmente no SQL
```sql
UPDATE event_registrations 
SET status = 'confirmed' 
WHERE id = 'REGISTRATION_ID';

UPDATE payments 
SET status = 'paid' 
WHERE registration_id = 'REGISTRATION_ID';
```

**Passo 2:** Atualizar página (F5)

### Solução 3: Migração Webhook Logs Não Feita

Se vir "relation 'webhook_logs' does not exist":

1. Executar migração no Supabase SQL Editor
2. Copiar: `MIGRAÇÃO_6_WEBHOOK_LOGS.sql`
3. Colar e executar

### Solução 4: RLS Policy Bloqueando

Se vir "permission denied":

```sql
-- Executar no Supabase SQL Editor
-- Recriar policies

SELECT * FROM pg_policies 
WHERE tablename IN ('webhook_logs', 'payments', 'event_registrations');

IF houver muitas policies, limpar:
-- ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;
-- Implementar novamente
```

---

## 🎯 Checklist de Verificação

- [ ] Webhook chegou: `npm run monitor:webhooks` mostra evento ✅
- [ ] Status HTTP é 200 (não 400/500)
- [ ] Tabela `webhook_logs` existe
- [ ] Tabela `payments` foi atualizada
- [ ] Tabela `event_registrations` status = "confirmed"
- [ ] Page foi atualizada manualmente (F5)
- [ ] Console (F12) não mostra erros

---

## 🔗 URLs Úteis

**Monitor Webhooks:**
```
npm run monitor:webhooks
```

**Ver Logs:**
```
http://localhost:3001/api/webhook/logs
```

**Supabase SQL:**
```
https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql
```

**Supabase Logs (Edge Function):**
```
https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/functions/abacatepay-webhook/logs
```

---

## 📊 Debug Info na Página

Quando página está em "Pagamento Pendente", ela mostra:

```
Tentativa 5 de 30...

📊 Informações de Debug:
  📌 Registration: 550e8400...
  💳 Billing ID: bill_abc1...
  🔄 Tentativas: 5/30
  👤 Participante: João Silva
  💰 Valor: R$ 99.90
```

**Usar para verificação:**
- Se Billing ID = branco → erro ao criar pagamento
- Se Tentativas = 30 → timeout

---

## 🚨 Última Chance: Reset Manual

Se tudo falhar, resetar manualmente:

```sql
-- 1. Cancelar inscrição
UPDATE event_registrations 
SET status = 'cancelled' 
WHERE id = 'REG_ID';

-- 2. Deletar pagamento
DELETE FROM payments 
WHERE registration_id = 'REG_ID';

-- 3. Começar novamente
```

Então tente fazer novo pagamento.

---

## 📞 Se Ainda Não Funcionar

Colete:
1. ID da Inscrição (registration_id)
2. ID da Cobrança (billing_id)
3. Screenshot de erro
4. Console log (F12)
5. Webhook log (`/api/webhook/logs`)

---

**Última atualização:** 23/02/2025
**Versão:** 1.1 - Com improve de debugging
