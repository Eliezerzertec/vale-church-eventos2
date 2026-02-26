# ✅ Checklist Completo: Implementacao de Webhook

## 🎯 Objetivo
Validar que seu sistema de webhook para confirmação de pagamento está 100% funcional.

---

## 📋 Fase 1: Verificação de Código

### 1.1: Arquivo Webhook Existe?
- [ ] Arquivo: `supabase/functions/abacatepay-webhook/index.ts`
- [ ] Tamanho: > 290 linhas
- [ ] Contém: `serve(async (req) => {`
- [ ] Contém: `validateWebhookSecret`
- [ ] Contém: `sendConfirmationEmail`

**Se não existir:** Criar arquivo (ver IMPLEMENTAR_WEBHOOK_COMPLETO.md)

### 1.2: Função de Validação?
```typescript
const validateWebhookSecret = (req: Request): boolean => { ... }
```
- [ ] Função existe
- [ ] Compara com `qwe123123`
- [ ] Retorna boolean

### 1.3: Atualização de Banco?
```typescript
await supabase.from("payments").update({ status: appStatus, ... })
await supabase.from("event_registrations").update({ status: "confirmed", ... })
```
- [ ] Atualiza table `payments`
- [ ] Atualiza table `event_registrations`
- [ ] Atualiza timestamp `updated_at`

### 1.4: Email de Confirmação?
```typescript
await sendConfirmationEmail(email, name, eventTitle)
```
- [ ] Função é chamada
- [ ] Usa `RESEND_API_KEY`
- [ ] Template HTML customizado ✓

---

## 🗄️ Fase 2: Verificação de Banco de Dados

### 2.1: Tabela `payments` Existe?
```sql
SELECT* FROM information_schema.tables 
WHERE table_name = 'payments';
```
- [ ] Tabela existe
- [ ] Colunas: `id`, `registration_id`, `billing_id`, `status`, `amount`, `created_at`, `updated_at`

**Coluna crítica:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'payments' AND column_name = 'billing_id';
```
- [ ] `billing_id` existe (do tipo TEXT)
- [ ] Se não existir: Criar migration
  ```sql
  ALTER TABLE payments ADD COLUMN billing_id TEXT;
  CREATE INDEX idx_payments_billing_id ON payments(billing_id);
  ```

### 2.2: Tabela `event_registrations` Existe?
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name IN ('status', 'payment_processed');
```
- [ ] Colunas `status` e `payment_processed` existem

### 2.3: Tabela `webhook_logs` Existe?
```sql
SELECT * FROM webhook_logs LIMIT 1;
```
- [ ] Tabela existe
- [ ] Colunas: `event`, `billing_id`, `response_status`, `error_message`, `created_at`

**Se não existir:** Execute migration
```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT,
  billing_id TEXT,
  request_body JSONB,
  response_status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX on billing_id, created_at DESC
);
```

### 2.4: RLS Não Bloqueia?
```sql
SELECT * FROM pg_catalog.pg_policies 
WHERE tablename IN ('payments', 'event_registrations', 'webhook_logs');
```
- [ ] Sem policies muito restritivas
- [ ] OU policies permitem INSERT/UPDATE (service role)
- [ ] Se bloqueado: Desabilitar RLS temporariamente
  ```
  Supabase Dashboard → Authentication → Policies
  → Desabilitar para tabelas de pagamento
  ```

---

## 🔑 Fase 3: Verificação de Variáveis de Ambiente

### 3.1: No Supabase (Function Secrets)
**Local:** Supabase Dashboard → Project Settings → Functions → Secrets

- [ ] `SUPABASE_URL` - Seu projeto URL
  ```
  Esperado: https://cwzmiznlvhhnpjgxgsme.supabase.co
  ```

- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key
  ```
  Esperado: eyJhbGc... (JWT token)
  Verificar: Dashboard → Settings → API → Service Role Key
  ```

- [ ] `ABACATEPAY_WEBHOOK_SECRET` - Secret do webhook
  ```
  Esperado: qwe123123
  ⚠️ CRÍTICO: Deve ser exatamente este valor
  ```

- [ ] `RESEND_API_KEY` (opcional)
  ```
  Se não tiver: Email não será enviado (apenas log)
  Se tiver: Deve ser re_...
  ```

- [ ] `RESEND_FROM` (opcional)
  ```
  Esperado: no-reply@seu-dominio.com
  Se não tiver: Usa padrão no código
  ```

**Como verificar no painel:**
```
1. Supabase Dashboard
2. Project Settings icon ⚙️
3. Functions
4. View Secrets
5. Verificar cada uma
```

### 3.2: Teste de Conexão
```typescript
// Adicione temporariamente no webhook para debug:
console.log("SUPABASE_URL:", Deno.env.get("SUPABASE_URL"));
console.log("Service key OK:", !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
console.log("Secret OK:", !!Deno.env.get("ABACATEPAY_WEBHOOK_SECRET"));
```

Deploy e veja os logs:
```bash
supabase functions logs abacatepay-webhook
```

---

## 📡 Fase 4: Configuração no AbacatePay

### 4.1: Webhook Configurado?
**Local:** AbacatePay Dashboard → Webhooks

- [ ] URL configurada
  ```
  https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
  ```

- [ ] Secret configurado
  ```
  qwe123123
  ```

- [ ] Evento selecionado
  ```
  ☑ billing.paid
  ```

- [ ] Status: Ativo
  ```
  ☑ Enabled/Ativo
  ```

### 4.2: Teste no AbacatePay
- [ ] Abra painel do webhook
- [ ] Clique "Enviar Teste" ou "Send Test"
- [ ] Resultado esperado:
  ```
  ✅ Status 200
  Resposta: {"ok": true, ...}
  ```

**Se erro:**
| Erro | Solução |
|------|---------|
| 401 | Secret incorreto |
| 404 | URL incorreta |
| Timeout | Edge function offline |
| 500 | Erro no processamento |

---

## 🎬 Fase 5: Teste com Pagamento Real

### 5.1: Setup Local
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev

# Terminal 3: Monitor webhooks
npm run monitor:webhooks
```

- [ ] Backend rodando: http://localhost:3001/health
- [ ] Frontend rodando: http://localhost:8081
- [ ] Monitor aguardando webhooks

### 5.2: Inscrição e Pagamento
1. [ ] Ir: http://localhost:8081/eventos/[ID_EVENTO]
2. [ ] Preencher formulário
3. [ ] Clicar "Pagar com AbacatePay"
4. [ ] Computar pagamento (PIX ou CARD)
5. [ ] Ser redirecionado para `/payment-confirmation/:id`

### 5.3: Verificar Status em Tempo Real

**Terminal 3 (monitor:webhooks):**
```
✅ Webhook recebido: billing.paid
   billing_id: ABC123XYZ
   status: 200
```
- [ ] Webhook aparece em ~3-10 segundos
- [ ] Status é 200 (sucesso)
- [ ] `billing_id` correto

**Browser (página de confirmação):**
```
⏳ Pagamento Pendente...
   Tentativa 1 de 30
   [Billing ID: ABC...]

(aguardar 10 segundos)

✅ Pagamento Confirmado!
   Seu pagamento foi processado com sucesso
```
- [ ] Página inicia como "Pendente"
- [ ] Após webhook, muda para "Confirmado"
- [ ] Mostra detalhes corretos

### 5.4: Verificar no Banco
```sql
-- Ver payment atualizado
SELECT registration_id, billing_id, status, updated_at 
FROM payments 
WHERE billing_id = 'ABC123XYZ'
LIMIT 1;

-- Esperado:
| registration_id | billing_id | status | updated_at |
|-----------------|-----------|--------|-----------|
| abc-123...      | ABC123XYZ  | paid   | 2026-02-23 14:35 |
```
- [ ] Payment status = "paid"
- [ ] updated_at atualizado

```sql
-- Ver registration atualizado
SELECT id, status, payment_processed, updated_at 
FROM event_registrations 
WHERE id = 'abc-123...'
LIMIT 1;

-- Esperado:
| id              | status    | payment_processed | updated_at |
|-----------------|-----------|------------------|-----------|
| abc-123...      | confirmed | true             | 2026-02-23 14:35 |
```
- [ ] Registration status = "confirmed"
- [ ] payment_processed = true

### 5.5: Verificar Log de Webhook
```sql
SELECT event, billing_id, response_status, created_at 
FROM webhook_logs 
WHERE billing_id = 'ABC123XYZ'
LIMIT 1;

-- Esperado:
| event           | billing_id | response_status | created_at |
|-----------------|-----------|-----------------|-----------|
| billing.paid    | ABC123XYZ  | 200             | 2026-02-23 14:35 |
```
- [ ] Evento registrado
- [ ] Status success (200)

---

## 📊 Fase 6: Monitoramento Avançado

### 6.1: Ver Logs do Webhook em Supabase
```bash
# CLI
supabase functions logs abacatepay-webhook
```

**Ou UI:**
```
Supabase Dashboard
  → Functions
  → abacatepay-webhook
  → Recent Invocations
  → Ver últimos 10-20
```

- [ ] Invocações aparecem
- [ ] Status: verde (200) ou vermelho (4xx, 5xx)
- [ ] Clicar para ver request/response

### 6.2: Alertas de Erro
Se webhooks com ❌ status aparecerem:

**Clique para expandir:**
```
❌ Invocation failed
Status: 401
Request: { ... }
Error: "Webhook com secret inválido"
```

**Checklist de correção:**
- [ ] Secret no AbacatePay = `qwe123123`
- [ ] Header enviado = `X-Webhook-Secret` ou `Authorization`
- [ ] Sem espaços extras

### 6.3: Notificações (Opcional)
Configure alertas para webhooks falhando:

**Via Supabase:**
```
Project Settings → Alerts
→ Create Alert
→ Condition: Functions invocations > X errors
→ Alert destination: Email
```

---

## 🎯 Fase 7: Produção (Vercel)

### 7.1: Variáveis em Produção
```
Vercel Dashboard → Settings → Environment Variables

Adicionar:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ABACATEPAY_KEY=...

(Webhook secrets no Supabase, não em Vercel)
```

- [ ] Variáveis configuradas
- [ ] Deploy feito: `git push`

### 7.2: Testar em Produção
1. [ ] Fazer pagamento em produção
2. [ ] Monitorar em Supabase → Functions
3. [ ] Verificar que email foi enviado
4. [ ] Verificar banco de dados

---

## 🚨 Troubleshooting Rápido

### Problema: Webhook não chega
```
Causa: Não configurado no AbacatePay
Checklist:
  [ ] URL no AbacatePay = https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
  [ ] Secret = qwe123123
  [ ] Evento = billing.paid
  [ ] Status = Ativo
  [ ] Teste foi enviado e teve sucesso
```

### Problema: Status permanece "Pendente"
```
Causa: Webhook chegou but não atualizou status
Checklist:
  [ ] Ver logs em Supabase → Functions (status é 200?)
  [ ] Verificar error_message em webhook_logs
  [ ] Verificar se RLS está bloqueando updates
  [ ] Verificar registração_id está correto
```

### Problema: "Payment not found (404)"
```
Causa: billing_id não foi salvo
Checklist:
  [ ] EventDetailPage.tsx salva billing_id?
  [ ] server.js recebe billing_id no POST /api/payment/create?
  [ ] Payments table tem coluna billing_id?
  [ ] SQL: SELECT COUNT(*) FROM payments WHERE billing_id = 'ABC';
```

### Problema: Email não enviado
```
Cause: RESEND_API_KEY não configurado
Checklist:
  [ ] Supabase → Function Secrets → RESEND_API_KEY
  [ ] Valor deve ser: re_...
  [ ] Se vazio, apenas permite logging (email não é enviado)
```

---

## ✨ Sucesso Esperado

Quando tudo está configurado corretamente:

```
1. Usuário paga ✅
   ↓
2. AbacatePay dispara webhook ✅
   ↓
3. Supabase recebe e valida secret ✅
   ↓
4. Atualiza payments.status = "paid" ✅
   ↓
5. Atualiza registrations.status = "confirmed" ✅
   ↓
6. Envia email de confirmação ✅
   ↓
7. Frontend vê mudança em ~3-10s ✅
   ↓
8. Mostra: ✅ PAGAMENTO CONFIRMADO! ✅
```

---

## 📋 Checklist Final (Imprimir e Colar na Parede!)

```
WEBHOOK SETUP CHECKLIST
=======================

Fase 1: Código
  [ ] Arquivo index.ts existe (295+ linhas)
  [ ] validateWebhookSecret existe
  [ ] sendConfirmationEmail existe
  [ ] Updates payments e registrations

Fase 2: Banco
  [ ] Table payments com billing_id
  [ ] Table event_registrations
  [ ] Table webhook_logs
  [ ] RLS não bloqueia

Fase 3: Variáveis
  [ ] SUPABASE_URL ✓
  [ ] SUPABASE_SERVICE_ROLE_KEY ✓
  [ ] ABACATEPAY_WEBHOOK_SECRET ✓
  [ ] RESEND_API_KEY (opcional)

Fase 4: AbacatePay
  [ ] URL configurada
  [ ] Secret configurado
  [ ] Evento billing.paid selecionado
  [ ] Teste passou com status 200

Fase 5: Teste Local
  [ ] npm run dev:backend
  [ ] npm run dev
  [ ] npm run monitor:webhooks
  [ ] Fiz pagamento de teste
  [ ] Webhook apareceu em ~10s
  [ ] Status mudou em ~10s

Fase 6: Monitoramento
  [ ] Supabase → Functions → Invocations
  [ ] Últimas 5 invocations são status 200
  [ ] webhook_logs tem registros

Fase 7: Produção
  [ ] Variáveis no Vercel (se usando)
  [ ] Deploy feito
  [ ] Teste em produção passou

RESULTADO: ✅ Sistema de webhook funcionando!
```

---

**Data:** 23 de Fevereiro de 2026
**Versão:** 1.0 - Checklist Completo
**Manutenção:** Revisado e atualizado regularmente
