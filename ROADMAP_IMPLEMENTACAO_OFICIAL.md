# 🛠️ Roadmap de Implementação Correta (Baseado em Oficial AbacatePay)

## 📍 Status Atual

✅ Implementado:
- Secret em header (X-Webhook-Secret)
- Atualização de status
- Envio de email
- Logging básico
- HTTPS

❌ Faltando (Crítico):
- HMAC-SHA256 verification
- Raw body validation
- Idempotência (duplicata protection)
- devMode checking
- Secret na URL (query parameter)

---

## 🎯 Fase 1: Verificar Payload Real

**Objetivo:** Saber exatamente qual formato AbacatePay envia

### Passo 1.1: Testar Webhook de Teste
```bash
# No AbacatePay Dashboard:
1. Webhooks → Seu webhook
2. Clique "Testar" ou "Send Test"
3. Observe o payload
```

### Passo 1.2: Ver Logs no Supabase
```bash
supabase functions logs abacatepay-webhook
```

**Procure por:**
```
console.log("Webhook recebido:", JSON.stringify(body, null, 2));
```

**Salve o payload para referência**

### Passo 1.3: Comparar com Documentação
```
Seu payload:
{
  "event": "billing.paid",
  "data": { ... }
}

Oficial (PIX QR Code):
{
  "id": "log_12345abcdef",
  "event": "billing.paid",
  "devMode": false,
  "data": {
    "payment": { ... },
    "pixQrCode": { ... }
  }
}
```

**Se for diferente:** Ajustar seu parsing

---

## 🔐 Fase 2: Implementar HMAC-SHA256

**Arquivo:** `supabase/functions/abacatepay-webhook/index.ts`

### Passo 2.1: Adicionar Função de Verificação

Adicione NO TOPO do arquivo (depois dos imports):

```typescript
// ✅ Adicione isto após imports
import crypto from "https://deno.land/std@0.110.0/crypto/mod.ts";

// Public key do AbacatePay (da documentação oficial)
const ABACATEPAY_PUBLIC_KEY = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNH..."; // Completa conforme docs

/**
 * Verifica assinatura HMAC-SHA256 do AbacatePay
 */
const verifyAbacateSignature = (rawBody: string, signatureFromHeader: string): boolean => {
  try {
    // 1. Converter body em buffer
    const bodyBuffer = new TextEncoder().encode(rawBody);
    
    // 2. Calcular HMAC-SHA256
    const keyBuffer = new TextEncoder().encode(ABACATEPAY_PUBLIC_KEY);
    
    // Usar Web Crypto API (funciona em Deno)
    const hmac = new crypto.Hmac("sha256");
    hmac.update(bodyBuffer);
    const calculatedSig = btoa(hmac.digest("utf8")); // Base64
    
    // 3. Comparar
    if (calculatedSig !== signatureFromHeader) {
      console.error("❌ Assinatura HMAC inválida");
      console.error("  Esperado:", signatureFromHeader?.slice(0, 20) + "...");
      console.error("  Calculado:", calculatedSig.slice(0, 20) + "...");
      return false;
    }
    
    console.log("✅ Assinatura HMAC validada com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao verificar HMAC:", error);
    return false;
  }
};
```

### Passo 2.2: Atualizar Função de Validação de Secret

SUBSTITUIR:
```typescript
const validateWebhookSecret = (req: Request): boolean => {
  const secret = req.headers.get("X-Webhook-Secret") || 
                 req.headers.get("x-webhook-secret") ||
                 req.headers.get("Authorization")?.replace("Bearer ", "");
```

POR:
```typescript
const validateWebhookSecret = (req: Request): boolean => {
  // 1. Tentar Query String PRIMEIRO (oficial)
  const url = new URL(req.url);
  const secretFromUrl = url.searchParams.get("webhookSecret");
  
  // 2. Fallback para Headers
  const secretFromHeader = req.headers.get("X-Webhook-Secret") || 
                          req.headers.get("x-webhook-secret") ||
                          req.headers.get("Authorization")?.replace("Bearer ", "");
  
  const secret = secretFromUrl || secretFromHeader;
  
  if (!secret) {
    console.warn("⚠️ Webhook sem header de autenticação");
    return false;
  }

  const isValid = secret === webhookSecret;
  
  if (!isValid) {
    console.error("❌ Webhook com secret inválido");
  } else {
    console.log("✅ Webhook autenticado com sucesso");
  }

  return isValid;
};
```

### Passo 2.3: Validar HMAC no Handler

Encontre a linha no `serve()`:
```typescript
try {
    const body = await req.json();
```

SUBSTITUIR por:
```typescript
try {
    // ✅ 1. Ler raw body ANTES de qualquer parse
    const rawBody = await req.text();
    
    // ✅ 2. Validar assinatura HMAC
    const signature = req.headers.get("x-webhook-signature") || 
                      req.headers.get("X-Webhook-Signature");
    
    if (!signature || !verifyAbacateSignature(rawBody, signature)) {
      await logWebhook("WEBHOOK_INVALID_SIGNATURE", "", {}, "401", "Assinatura HMAC inválida");
      return new Response("Unauthorized", { status: 401 });
    }
    
    // ✅ 3. Parse JSON DEPOIS de validar
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      await logWebhook("WEBHOOK_PARSE_ERROR", "", {}, "400", parseError.message);
      return new Response("Invalid JSON", { status: 400 });
    }
```

---

## 🔄 Fase 3: Implementar Idempotência

**Objetivo:** Processar cada webhook apenas uma vez

### Passo 3.1: Criar Tabela

Execute no Supabase SQL Editor:
```sql
-- Rastrear webhooks processados
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,                        -- webhook.id (log_12345abcdef)
  event TEXT NOT NULL,                        -- "billing.paid" etc
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'processed',            -- 'processed', 'failed', 'skipped'
  error_message TEXT,
  payload JSONB                               -- Salvar payload para debug
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_time 
  ON webhook_events(event, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_id 
  ON webhook_events(id);

-- Table para rastrear por billing_id também
CREATE TABLE IF NOT EXISTS webhook_billing_map (
  webhook_id TEXT PRIMARY KEY,                -- webhook.id
  billing_id TEXT,                            -- payment billing id
  FOREIGN KEY (webhook_id) REFERENCES webhook_events(id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_billing_map_billing_id 
  ON webhook_billing_map(billing_id);
```

### Passo 3.2: Verificar antes de Processar

Adicione no handler (após JSON parse):

```typescript
    // ✅ Extrair event ID
    const webhookId = body.id;  // "log_12345abcdef"
    const event = body.event;   // "billing.paid"
    
    console.log(`[Webhook ${webhookId}] Evento: ${event}`);
    
    // ✅ Verificar se já foi processado
    if (webhookId) {
      const { data: existing } = await supabase
        .from("webhook_events")
        .select("id, status")
        .eq("id", webhookId)
        .maybeSingle();
      
      if (existing) {
        console.log(`⏭️  Webhook ${webhookId} já foi processado (status: ${existing.status})`);
        
        // Retornar 200 OK mesmo assim (idempotent)
        return new Response(
          JSON.stringify({ 
            ok: true, 
            message: `Webhook já processado: ${existing.status}`,
            webhookId 
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }
```

### Passo 3.3: Marcar como Processado (Sucesso)

Depois que processar com SUCESSO, adicione:

```typescript
    // ✅ Após processar com sucesso
    if (webhookId) {
      try {
        await supabase.from("webhook_events").insert({
          id: webhookId,
          event: event,
          status: "processed",
          payload: body  // Salvar payload para debug
        });
        
        // Se tiver billing_id, mapear também
        const billingId = body.data?.billing?.id || body.data?.pixQrCode?.id;
        if (billingId) {
          await supabase.from("webhook_billing_map").insert({
            webhook_id: webhookId,
            billing_id: billingId
          }).catch(() => {}); // Ignore duplicates
        }
      } catch (error) {
        console.warn("Erro ao registrar webhook_events:", error);
        // Continua mesmo se falhar (webhook já foi processado)
      }
    }
    
    return new Response(
      JSON.stringify({ ok: true, message: "Webhook processado", webhookId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
```

### Passo 3.4: Marcar como Falhado (No catch)

No bloco `catch` do handler:

```typescript
  } catch (error) {
    console.error("Erro no webhook:", error);
    
    // ✅ Registrar falha
    if (webhookId) {
      try {
        await supabase.from("webhook_events").insert({
          id: webhookId,
          event: event || "unknown",
          status: "failed",
          error_message: error.message,
          payload: body
        }).catch(() => {}); // Pode já estar inserido
      } catch (logError) {
        console.warn("Erro ao registrar falha:", logError);
      }
    }
    
    // Retornar erro apropriado (para retry)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
```

---

## ⚠️ Fase 4: Adicionar devMode Check

Após extrair event e antes de processar:

```typescript
    // ✅ Verificar devMode (ambiente)
    const devMode = body.devMode || false;
    
    if (devMode) {
      console.log("ℹ️ Webhook de DESENVOLVIMENTO (teste)");
      
      // Decidir se processa ou ignora
      // Opção A: Ignorar em produção
      if (Deno.env.get("ENVIRONMENT") === "production") {
        console.log("⏭️  Ignorando evento de desenvolvimento em produção");
        
        return new Response(
          JSON.stringify({ 
            ok: true, 
            message: "Evento de dev ignorado em produção",
            webhookId 
          }),
          { status: 200 }
        );
      }
      
      // Opção B: Log destacado para desenvolvimento
      console.log("🧪 [DEV MODE] Processando evento de teste");
    }
```

---

## ✅ Fase 5: Testar Localmente

### Passo 5.1: Deploy Temporário
```bash
supabase functions deploy abacatepay-webhook
```

### Passo 5.2: Teste de Webhook Falso
```bash
# Terminal 1: Monitorar logs
supabase functions logs abacatepay-webhook

# Terminal 2: Enviar request de teste
curl -X POST https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook?webhookSecret=qwe123123 \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: qwe123123" \
  -H "X-Webhook-Signature: invalid_signature" \
  -d '{
    "id": "log_test_12345",
    "event": "billing.paid",
    "devMode": true,
    "data": {
      "payment": {
        "amount": 1000,
        "fee": 80,
        "method": "PIX"
      }
    }
  }'
```

**Esperado:**
```
❌ Assinatura HMAC inválida
⏭️  Ignorando evento de desenvolvimento
```

### Passo 5.3: Enviar Webhook Real (AbacatePay)
```
AbacatePay Dashboard
  → Webhooks
  → [Seu webhook]
  → "Testar"
```

**Procure nos logs:**
```
✅ Webhook autenticado
✅ Assinatura HMAC validada
✅ Webhook processado
```

---

## 📊 Fase 6: Produção

### Passo 6.1: Validar no Supabase

```sql
-- Ver webhooks processados
SELECT id, event, status, error_message, processed_at 
FROM webhook_events 
ORDER BY processed_at DESC 
LIMIT 10;

-- Ver mapeamento billing_id
SELECT webhook_id, billing_id 
FROM webhook_billing_map 
LIMIT 10;
```

### Passo 6.2: Fazer Pagamento Real

1. Ir: http://localhost:8081/eventos/[ID_EVENTO]
2. Fazer inscrição paga
3. Completar pagamento
4. Verificar webhook foi processado (sem duplicata)

---

## 🎯 Checklist Final

- [ ] **Fase 1:** Payload real verificado
- [ ] **Fase 2:** HMAC-SHA256 implementado
- [ ] **Fase 2b:** Secret via URL (query) adicionado
- [ ] **Fase 2c:** Raw body validation funciona
- [ ] **Fase 3:** Tabela webhook_events criada
- [ ] **Fase 3b:** Idempotência testada (processar 2x = OK)
- [ ] **Fase 4:** devMode check adicionado
- [ ] **Fase 5:** Teste local passou
- [ ] **Fase 6:** Pagamento real confirmou
- [ ] **Fase 6b:** Webhook_events mostra 1 entrada (não duplicata)

---

## 📌 Arquivos a Modificar

```
supabase/functions/abacatepay-webhook/index.ts
  • Linha ~1-5: Adicionar import crypto
  • Linha ~10-30: Adicionar verifyAbacateSignature()
  • Linha ~15-33: Atualizar validateWebhookSecret()
  • Linha ~110: Mudar "const body = await req.json()" para raw body handling
  • Linha ~115+: Adicionar HMAC validation
  • Linha ~130+: Adicionar idempotence check
  • Linha ~250+: Adicionar webhook_events insert
```

---

## 🚀 Deploy After Changes

```bash
# 1. Commit
git add supabase/functions/abacatepay-webhook/index.ts
git commit -m "feat: implements HMAC-SHA256, idempotence, devMode checking"

# 2. Deploy
supabase functions deploy abacatepay-webhook

# 3. Logs
supabase functions logs abacatepay-webhook
```

---

**Data:** 23 de Fevereiro de 2026
**Baseado em:** Documentação Oficial AbacatePay
**Status:** Roadmap Prático de Implementação ✅
