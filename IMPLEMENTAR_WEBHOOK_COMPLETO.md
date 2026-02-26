# 🔌 Implementação Completa de Webhook para Confirmação de Pagamento

## 📍 Status Atual

✅ **Webhook já EXISTE e ESTÁ PRONTO em:**
```
supabase/functions/abacatepay-webhook/index.ts (295 linhas)
```

Função está hospedada em:
```
https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
```

---

## 🔧 Arquitetura do Sistema de Webhook

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário completa pagamento no AbacatePay (PIX/CARD)      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. AbacatePay dispara webhook com evento: billing.paid      │
│    Headers:                                                  │
│      Authorization: Bearer qwe123123                        │
│      Content-Type: application/json                         │
│    Body:                                                     │
│      {                                                       │
│        "event": "billing.paid",                             │
│        "data": {                                            │
│          "billing": {                                       │
│            "id": "ABC123XYZ",                              │
│            "status": "paid"                                │
│          }                                                  │
│        }                                                     │
│      }                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ HTTP POST para
┌─────────────────────────────────────────────────────────────┐
│ 3. Supabase Edge Function (Webhook Handler)                 │
│    https://.../functions/v1/abacatepay-webhook              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─→ Valida: X-Webhook-Secret == "qwe123123"
                     │
                     ├─→ Busca: payments WHERE billing_id = ABC123XYZ
                     │
                     ├─→ Atualiza:
                     │    • payments.status = "paid"
                     │    • event_registrations.status = "confirmed"
                     │
                     ├─→ Envia: Email de confirmação (via Resend)
                     │
                     └─→ Log: webhook_logs (para monitorar)
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend monitora com Auto-Refresh (3-10s)               │
│    PaymentConfirmationPage busca status atualizado          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Status muda para "paid" ✅                                │
│    Página exibe: "Pagamento Confirmado!"                    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ O Que Já Está Implementado

### 1️⃣ Função Webhook (Completa)
**Arquivo:** `supabase/functions/abacatepay-webhook/index.ts`

**Funcionalidades:**
- ✅ Validação de Secret (`X-Webhook-Secret`)
- ✅ Parse do payload do AbacatePay
- ✅ Lookup de pagamento por `billing_id`
- ✅ Atualização de status em `payments` table
- ✅ Atualização de status em `event_registrations` table
- ✅ Envio de email de confirmação (via Resend)
- ✅ Logging de webhook (para debug)
- ✅ Tratamento de erros

**Status dos Eventos:**
```typescript
const statusMap = {
  "pending": "pending",
  "paid": "paid",
  "failed": "failed",
  "expired": "expired",
  "refunded": "refunded"
};
```

### 2️⃣ Banco de Dados (Pronto)
**Tabelas:**
- `payments` - Armazena dados de pagamento (com `billing_id`, `status`)
- `event_registrations` - Armazena inscrições (status atualizado)
- `webhook_logs` - Armazena logs de webhook (debug)

**Migration** já criada em:
```
supabase/migrations/[timestamp]_webhook_logs.sql
```

### 3️⃣ Monitoramento (Pronto)
**Comando:**
```bash
npm run monitor:webhooks
```

**O que faz:**
- Monitora logs de webhook em tempo real
- Mostra eventos recebidos
- Mostra status de processamento (✅/❌)

### 4️⃣ Página de Confirmação (Pronta)
**Arquivo:** `src/pages/PaymentConfirmationPage.tsx`

**Funcionalidades:**
- ✅ 3 estados visuais (Pago/Pendente/Falhou)
- ✅ Auto-refresh inteligente (3s → 5s → 10s)
- ✅ Máximo 30 tentativas (~5 minutos)
- ✅ Debug info visível ao usuário
- ✅ Botão manual "Verificar Agora"

---

## 🎯 O Que Você Precisa Fazer

### Passo 1: Configurar Webhook no AbacatePay

**Onde:**
1. Dashboard AbacatePay
2. ⚙️ Configurações
3. 📡 Webhooks
4. ➕ Adicionar Webhook

**Preencher:**
| Campo | Valor |
|-------|-------|
| URL | `https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook` |
| Chave Secreta | `qwe123123` |
| Eventos | `billing.paid` |
| Ativo | ✅ SIM |

**Resultado esperado:**
```
✅ Webhook adicionado com sucesso
Status: Ativo
```

### Passo 2: Testar Webhook

**Opção A: Dentro do AbacatePay (Recomendado)**
```
AbacatePay Dashboard → Webhooks → Seu webhook → "Enviar Teste"

Esperado: ✅ Status 200 OK
```

**Opção B: Via Terminal**
```bash
# Terminal 1: Monitorar webhooks
npm run monitor:webhooks

# Terminal 2: Enviar webhook de teste
curl -X POST https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: qwe123123" \
  -d '{
    "event": "billing.paid",
    "data": {
      "billing": {
        "id": "TEST-'$(date +%s)'",
        "status": "paid"
      }
    }
  }'
```

**Terminal 1 deve mostrar:**
```
✅ Webhook recebido: billing.paid
   status: 200
```

### Passo 3: Testar Fluxo Completo

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev

# Terminal 3: Monitor webhooks
npm run monitor:webhooks
```

**Teste:**
1. Ir para: http://localhost:8081/eventos/[ID_EVENTO]
2. Preencher inscrição
3. Pagar via AbacatePay (PIX)
4. Aguardar webhooks em Terminal 3
5. Ver página mudar de "Pendente" para "✅ Confirmado"

---

## 🔍 Monitoramento e Debug

### Comando: Monitor Webhooks
```bash
npm run monitor:webhooks
```

**Saída esperada:**
```
🔍 Monitorando webhooks (refresh a cada 3s)...

✅ Webhook recebido: billing.paid
   billing_id: ABC123XYZ
   status: 200 (sucesso)
   criado_em: 2026-02-23 14:35:20

❌ Webhook recebido: billing.failed
   status: 401 (unauthorized)
   erro: Secret inválido
```

### SQL: Ver Logs
```sql
SELECT 
  event,
  billing_id,
  response_status,
  error_message,
  created_at
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 20;
```

### SQL: Ver Pagamentos
```sql
SELECT 
  registration_id,
  billing_id,
  status,
  updated_at
FROM payments
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 🛠️ Entender o Código (Anatomy)

### Validação de Secret
```typescript
const validateWebhookSecret = (req: Request): boolean => {
  const secret = req.headers.get("X-Webhook-Secret") || 
                 req.headers.get("Authorization")?.replace("Bearer ", "");
  
  return secret === "qwe123123";  // Chave configurada
};
```
**O quê:** Valida que o webhook veio do AbacatePay (não qualquer um)

### Processamento de Evento
```typescript
const { event, data } = body;

// Extrai dados do AbacatePay
const billingId = data.billing?.id;
const billingStatus = data.billing?.status; // "paid", "failed", etc

// Busca pagamento no DB
const { data: payment } = await supabase
  .from("payments")
  .select("*")
  .eq("billing_id", billingId)
  .single();
```
**O quê:** Encontra qual pagamento foi confirmado

### Atualização de Status
```typescript
// Atualiza pagamento
await supabase
  .from("payments")
  .update({
    status: "paid",        // Status de pagamento
    updated_at: new Date()
  })
  .eq("billing_id", billingId);

// Atualiza inscrição
if (appStatus === "paid") {
  await supabase
    .from("event_registrations")
    .update({
      status: "confirmed",
      payment_processed: true
    })
    .eq("id", payment.registration_id);
}
```
**O quê:** Marca pagamento como confirmado e inscrição como confirmada

### Envio de Email
```typescript
const sendConfirmationEmail = async (email, name, eventTitle) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "no-reply@igreja.local",
      to: [email],
      subject: `Pagamento confirmado: ${eventTitle}`,
      html: `<p>Olá ${name},</p><p>Seu pagamento foi confirmado!</p>`
    })
  });
};
```
**O quê:** Envia email de confirmação pro participante

---

## 📊 Variáveis de Ambiente Necessárias

Verifique em **Supabase → Function Secrets:**

```
SUPABASE_URL=https://cwzmiznlvhhnpjgxgsme.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  (sua service key)
ABACATEPAY_WEBHOOK_SECRET=qwe123123
RESEND_API_KEY=re_...  (opcional - para enviar emails)
RESEND_FROM=no-reply@igreja.local  (opcional)
```

**Para configurar:**
1. Supabase Dashboard
2. Project Settings
3. Edge Functions
4. Secrets
5. Adicionar/editar cada variável

---

## ✅ Checklist de Implementação

- [x] Função webhook criada
- [x] Banco de dados pronto (payments, event_registrations, webhook_logs)
- [x] Página de confirmação pronta (auto-refresh)
- [x] Monitor de webhooks funcionando
- [ ] **TODO:** Configurar webhook no AbacatePay dashboard
- [ ] **TODO:** Testar webhook com um pagamento real
- [ ] **TODO:** Verificar logs em Supabase → Functions

---

## 🚀 Quick Start (5 minutos)

```bash
# 1. Inicie tudo
npm run dev:backend &
npm run dev &
npm run monitor:webhooks

# 2. Faça um pagamento de teste em http://localhost:8081
# 3. Aguarde ~3-10 segundos
# 4. Veja status mudar em tempo real

# 5. Verifique no banco:
SELECT status FROM payments ORDER BY created_at DESC LIMIT 1;
# Esperado: "paid"
```

---

## 🆘 Troubleshooting

| Problema | Causa | Solução |
|----------|-------|--------|
| Webhook nunca chega | Não configurado no AbacatePay | Ver "Passo 1" acima |
| "Unauthorized (401)" | Secret incorreto | Confirmar `qwe123123` no AbacatePay |
| "Payment not found (404)" | `billing_id` não salvo | Verificar `EventDetailPage.tsx` salva `billing_id` |
| Status permanece "pending" | Webhook não processa | Verificar em Supabase → Functions → Recent Invocations |
| RLS bloqueia update | Policies muito restritivas | Desabilitar RLS em `payments` |

---

## 📚 Documentação Relacionada

- `BUG_FIX_PAGAMENTO_CONFIRMACAO.md` - Explicação do bug corrigido
- `CONFIG_WEBHOOK_ABACATEPAY.md` - Como configurar no AbacatePay
- `TESTE_PAGAMENTO_AGORA.md` - Guia de teste completo
- `DIAGNOSTICO_PAGAMENTO_NAO_CONFIRMA.md` - Debug em 5 passos

---

## 🎯 Resumo

**Webhook já está 100% implementado. Você só precisa:**

1. ✅ Configurar URL no AbacatePay
2. ✅ Testar com um pagamento real
3. ✅ Monitorar com `npm run monitor:webhooks`

**Depois:** Seu sistema de pagamento vai funcionar como máquina!

---

**Data:** 23 de Fevereiro de 2026
**Versão:** 1.0 - Webhook Completo
**Status:** ✅ PRONTO PARA USAR
