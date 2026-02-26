# 🔧 Guia Técnico: Entender e Modificar Webhook

## 📍 Arquivo Principal

```
supabase/functions/abacatepay-webhook/index.ts (295 linhas)
```

**Linguagem:** TypeScript (Deno runtime)

---

## 🏗️ Estrutura do Código

```
┌─────────────────────────────────────────────────────┐
│ 1. IMPORTS (Dependências)                           │
├─────────────────────────────────────────────────────┤
│ • Deno std HTTP server                              │
│ • Supabase JS client                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. CONFIG (Variáveis de Ambiente)                   │
├─────────────────────────────────────────────────────┤
│ • SUPABASE_URL                                      │
│ • SUPABASE_SERVICE_ROLE_KEY                         │
│ • ABACATEPAY_WEBHOOK_SECRET                         │
│ • RESEND_API_KEY (opcional)                         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. FUNÇÕES AUXILIARES                               │
├─────────────────────────────────────────────────────┤
│ • validateWebhookSecret()    - Valida autorização   │
│ • sendConfirmationEmail()    - Envia email          │
│ • logWebhook()               - Registra log         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. HANDLER PRINCIPAL                                │
├─────────────────────────────────────────────────────┤
│ serve(async (req) => { ... })                       │
│                                                      │
│ • Valida método (POST)                              │
│ • Valida secret                                     │
│ • Parse JSON                                        │
│ • Extrai dados do AbacatePay                        │
│ • Busca pagamento no DB                             │
│ • Atualiza status                                   │
│ • Envia email                                       │
│ • Retorna resposta                                  │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Análise Linha-por-Linha

### Seção 1: Validação de Autenticação (Linhas 15-33)

```typescript
const validateWebhookSecret = (req: Request): boolean => {
  // Tenta obter secret de 3 lugares (compatibilidade)
  const secret = req.headers.get("X-Webhook-Secret") || 
                 req.headers.get("x-webhook-secret") ||
                 req.headers.get("Authorization")?.replace("Bearer ", "");
  
  // Verifica se veio sem header
  if (!secret) {
    console.warn("⚠️ Webhook sem header de autenticação");
    return false;
  }

  // Compara com chave configurada
  const isValid = secret === webhookSecret;  // "qwe123123"
  
  if (!isValid) {
    console.error("❌ Webhook com secret inválido");
  } else {
    console.log("✅ Webhook autenticado com sucesso");
  }

  return isValid;
};
```

**O que faz:**
- Procura secret em múltiplos headers (flexibilidade)
- Compara com valor esperado
- Retorna true/false

**Por quê?** Previne chamadas de pessoas não-autorizadas

---

### Seção 2: Envio de Email (Linhas 35-70)

```typescript
const sendConfirmationEmail = async (
  to: string | null,
  name: string | null,
  eventTitle: string | null
) => {
  // Se não tiver email, não faz nada
  if (!to) return;
  
  // Se não tiver API key, apenas log
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY não configurada; email não enviado");
    return;
  }

  // Montar assunto e corpo
  const subject = eventTitle
    ? `Pagamento confirmado: ${eventTitle}`
    : "Pagamento confirmado";

  const html = `
    <p>Olá ${name || ""},</p>
    <p>Recebemos a confirmação do seu pagamento.</p>
    ${eventTitle ? `<p>Evento: <strong>${eventTitle}</strong></p>` : ""}
    <p>Sua inscrição está confirmada. Nos vemos lá!</p>
  `;

  // Enviar via Resend API
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [to],
      subject,
      html,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Erro ao enviar email de confirmação:", text);
  }
};
```

**O que faz:**
- Monta HTML do email
- Envia via Resend API
- Log de erros

**Para adicionar customizador:**
```typescript
// Exemplo: Adicionar logo da igreja
const html = `
  <img src="https://seu-dominio/logo.png" alt="Igreja" />
  <p>Olá ${name || ""},</p>
  ...
`;
```

---

### Seção 3: Log de Webhooks (Linhas 72-90)

```typescript
const logWebhook = async (
  event: string,
  billingId: string,
  requestBody: any,
  status: string,
  errorMessage?: string
) => {
  try {
    // Inserir na tabela webhook_logs
    await supabase.from("webhook_logs").insert({
      event,
      billing_id: billingId,
      request_body: requestBody,
      response_status: status,
      error_message: errorMessage || null,
    });
  } catch (error) {
    // Se log falhar, apenas avisar (não parar processamento)
    console.warn("Erro ao registrar log de webhook:", error);
  }
};
```

**O que faz:**
- Armazena cada webhook no banco
- Serve para monitoramento
- Fallback se falhar (não quebra o flow)

**Para debug avançado, adicione:**
```typescript
const logWebhook = async (...) => {
  try {
    await supabase.from("webhook_logs").insert({
      event,
      billing_id: billingId,
      request_body: requestBody,
      response_status: status,
      error_message: errorMessage || null,
      ip_address: req.headers.get("x-forwarded-for"), // IP de origem
      user_agent: req.headers.get("user-agent"),      // User agent
    });
  } catch (error) {
    console.warn("Erro ao registrar log:", error);
  }
};
```

---

### Seção 4: Handler Principal (Linhas 92-295)

#### 4a: Validação HTTP (Linhas 92-101)

```typescript
serve(async (req) => {
  // Aceitar OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response("OK", { status: 200 });
  }

  // Apenas POST permitido
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
```

**O que faz:** Valida que é uma requisição POST (não GET, DELETE, etc)

#### 4b: Validação de Secret (Linhas 103-108)

```typescript
  if (!validateWebhookSecret(req)) {
    await logWebhook("WEBHOOK_UNAUTHORIZED", "", await req.json().catch(() => ({})), "401", "Secret inválido ou ausente");
    return new Response("Unauthorized", { status: 401 });
  }
```

**O que faz:** Rejeita se secret inválido

#### 4c: Parse do Payload (Linhas 110-135)

```typescript
  try {
    const body = await req.json();

    console.log("Webhook recebido:", JSON.stringify(body, null, 2));

    // Extrair event e data
    const { event, data } = body;

    if (!event || !data) {
      await logWebhook("INVALID_PAYLOAD", "", body, "400", "Payload inválido: faltam event ou data");
      return new Response("Invalid payload", { status: 400 });
    }

    // Extrair IDs e status
    const billingId = data.billing?.id || data.id;
    const billingStatus = (data.billing?.status || data.status || "").toLowerCase();
    const paymentMethod = data.payment?.method || "PIX";
    const eventId = data.billing?.products?.[0]?.externalId;

    if (!billingId || !billingStatus) {
      return new Response("Missing billing data", { status: 400 });
    }
```

**O que faz:** 
- Parse JSON
- Extrai campos importantes
- Valida que estão presentes

**Estrutura esperada do AbacatePay:**
```json
{
  "event": "billing.paid",
  "data": {
    "billing": {
      "id": "ABC123XYZ",
      "status": "paid",
      "products": [
        {
          "externalId": "EVENT_ID"
        }
      ]
    },
    "payment": {
      "method": "PIX"
    }
  }
}
```

#### 4d: Lookup do Pagamento (Linhas 137-170)

```typescript
    // Buscar pagamento no banco de dados
    let paymentData = null;
    let paymentError = null;

    // Tenta primeiro por billing_id
    const { data: payment1, error: error1 } = await supabase
      .from("payments")
      .select("*")
      .eq("billing_id", billingId)
      .single();

    if (!error1 && payment1) {
      paymentData = payment1;
    } else {
      // Fallback: tenta por transaction_id
      const { data: payment2, error: error2 } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_id", billingId)
        .single();

      if (!error2 && payment2) {
        paymentData = payment2;
      } else {
        paymentError = error1 || error2;
      }
    }

    if (paymentError) {
      console.error("Erro ao buscar pagamento:", paymentError);
      return new Response("Payment not found", { status: 404 });
    }

    if (!paymentData) {
      console.error("Pagamento não encontrado para billing_id:", billingId);
      return new Response("Payment not found", { status: 404 });
    }

    const payment = paymentData;
```

**O que faz:**
- Busca payment na DB por billing_id (primeiro)
- Se não achar, tenta por transaction_id (fallback)
- Se não achar, retorna 404

#### 4e: Mapear Status (Linhas 172-188)

```typescript
    // Mapear status do AbacatePay para app
    const statusMap: Record<string, string> = {
      pending: "pending",
      paid: "paid",
      failed: "failed",
      expired: "expired",
      refunded: "refunded",
    };

    const appStatus = statusMap[billingStatus] || billingStatus;
```

**O que faz:**
- Converte status do AbacatePay para formato do app
- Se não reconhecer, usa como-está

**Para adicionar novo status:**
```typescript
const statusMap: Record<string, string> = {
  // ... existentes
  "partial_paid": "pending",  // Novo mapeamento
  "cancelled": "failed",       // Novo mapeamento
};
```

#### 4f: Atualizar Payment (Linhas 190-203)

```typescript
    // Atualizar status do pagamento
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        status: appStatus,
        billing_id: billingId,
        payment_method: paymentMethod,
        event_id: eventId,
        paid_at: appStatus === "paid" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("billing_id", billingId);

    if (updatePaymentError) {
      console.error("Erro ao atualizar pagamento:", updatePaymentError);
      return new Response("Failed to update payment", { status: 500 });
    }
```

**O que faz:**
- Atualiza status do pagamento
- Salva timestamp
- Se status = "paid", marca como pago

#### 4g: Confirmar Inscrição (Linhas 205-227)

```typescript
    // Se pagamento foi confirmado, confirmar inscrição
    if (appStatus === "paid") {
      const { error: registrationError } = await supabase
        .from("event_registrations")
        .update({
          status: "confirmed",
          payment_processed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.registration_id);

      if (registrationError) {
        console.error("Erro ao confirmar inscrição:", registrationError);
        return new Response("Failed to confirm registration", { status: 500 });
      }

      console.log(`Inscrição ${payment.registration_id} confirmada após pagamento`);

      // Enviar email de confirmação (best effort)
      let eventTitle: string | null = null;
      if (payment.event_id) {
        const { data: eventData } = await supabase
          .from("events")
          .select("title")
          .eq("id", payment.event_id)
          .maybeSingle();
        eventTitle = eventData?.title || null;
      }

      await sendConfirmationEmail(
        payment.registration_email || null,
        payment.registration_name || null,
        eventTitle
      );
    }
```

**O que faz:**
- Se status = "paid", marca inscrição como "confirmed"
- Busca título do evento
- Envia email

#### 4h: Cancelar Inscrição (Linhas 229-250)

```typescript
    // Se pagamento falhou, cancelar inscrição
    if (appStatus === "failed" || appStatus === "expired") {
      const { error: cancelError } = await supabase
        .from("event_registrations")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.registration_id);

      if (cancelError) {
        console.error("Erro ao cancelar inscrição:", cancelError);
      }

      console.log(`Inscrição ${payment.registration_id} cancelada (status: ${appStatus})`);
    }
```

**O que faz:**
- Se status = "failed" ou "expired", cancela inscrição

---

## 🎯 Como Modificar/Estender

### Modificação 1: Adicionar Campo Customizado

**Problema:** Quer salvar "valor pago" do pagamento

**Solução:**

1. Adicionar coluna em migrations:
```sql
ALTER TABLE payments 
ADD COLUMN paid_amount DECIMAL(10, 2);
```

2. Atualizar webhook para salvar:
```typescript
const { error: updatePaymentError } = await supabase
  .from("payments")
  .update({
    // ... existentes
    paid_amount: data.billing?.amount / 100,  // Converter de centavos
  })
  .eq("billing_id", billingId);
```

### Modificação 2: Adicionar Nova Ação

**Problema:** Quer enviar SMS além de email

**Solução:**

1. Criar função sendSMS:
```typescript
const sendSMS = async (phone: string, name: string) => {
  const message = `Olá ${name}, seu pagamento foi confirmado!`;
  
  // Usar serviço SMS (Twilio, AWS SNS, etc)
  await fetch("https://api.twilio.com/...", {
    // ...
  });
};
```

2. Chamar no handler:
```typescript
if (appStatus === "paid") {
  // ... email code
  
  // Novo: SMS
  await sendSMS(
    payment.registration_phone,
    payment.registration_name
  );
}
```

### Modificação 3: Adicionar Webhook Secundário

**Problema:** Quer notificar outro sistema (Discord, Slack, etc)

**Solução:**

```typescript
const notifyDiscord = async (event: string, billingId: string, status: string) => {
  const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!webhookUrl) return;
  
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `✅ ${event}: ${billingId} (${status})`,
      embeds: [{
        title: event,
        description: `Billing ID: ${billingId}\nStatus: ${status}`,
        color: status === "paid" ? 0x00FF00 : 0xFF0000,
      }]
    })
  });
};
```

Chamar no handler:
```typescript
await notifyDiscord(event, billingId, appStatus);
```

---

## 🧪 Teste Local (Sem Deploy)

Para testar mudanças antes de fazer deploy:

```bash
# 1. Terminal: Iniciar localmente
supabase functions serve abacatepay-webhook

# 2. Outro terminal: Enviar teste
curl -X POST http://localhost:54321/functions/v1/abacatepay-webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: qwe123123" \
  -d '{
    "event": "billing.paid",
    "data": {
      "billing": {
        "id": "test123",
        "status": "paid"
      }
    }
  }'
```

---

## 📊 Debug Avançado

### Ver Logs Completos
```bash
# No Supabase Dashboard:
Functions → abacatepay-webhook → Recent Invocations

# Ou via CLI:
supabase functions logs abacatepay-webhook
```

### Ver Payload Exato
Adicione em cima do handler:
```typescript
console.log("Raw request:", await req.clone().text());
```

### Ver Estrutura do Banco
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;
```

---

## 🚀 Deploy de Mudanças

Após modificar código:

```bash
# 1. Commitar mudanças
git add supabase/functions/abacatepay-webhook/index.ts
git commit -m "feat: webhook customização X"

# 2. Deploy
supabase functions deploy abacatepay-webhook

# 3. Ver status
supabase functions describe abacatepay-webhook
```

---

**Data:** 23 de Fevereiro de 2026
**Versão:** 1.0 - Guia Técnico Completo
