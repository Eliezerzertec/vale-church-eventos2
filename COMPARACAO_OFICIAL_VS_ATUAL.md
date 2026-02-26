# ✅❌ Comparação: Implementação Atual vs Padrões Oficiais AbacatePay

## 📊 Checklist de Conformidade

| Item | Oficial AbacatePay | Seu Projeto | Status | Ação Necessária |
|------|------------------|-----------|--------|-----------------|
| **Secret na URL** | ✅ Suportado | ❓ Verificar | ⚠️ | Ver seção 1 |
| **Secret em Header** | ✅ Recomendado | ✅ Implementado (X-Webhook-Secret) | ✅ | Nenhuma |
| **Assinatura HMAC** | ✅ Recomendado (CRÍTICO) | ❌ NÃO implementado | 🔴 | Ver seção 2 |
| **Validação Raw Body** | ✅ OBRIGATÓRIO para HMAC | ❌ NÃO (parsing antes) | 🔴 | Ver seção 3 |
| **ID Único por Evento** | ✅ Campo `id` presente | ❌ NÃO verifica | 🔴 | Ver seção 4 |
| **Idempotência** | ✅ Recomendado | ❌ NÃO implementado | 🔴 | Ver seção 4 |
| **HTTPS** | ✅ OBRIGATÓRIO | ✅ Sim (Supabase Edge Fn) | ✅ | Nenhuma |
| **devMode Check** | ✅ Recomendado | ❌ NÃO verifica | ⚠️ | Ver seção 5 |
| **Resposta HTTP Corretas** | ✅ 2xx/4xx/5xx | ✅ Sim | ✅ | Nenhuma |
| **Ambientes Separados** | ✅ Dev vs Prod | ❓ Possivelmente mesma URL | ⚠️ | Ver seção 6 |

---

## 🔴 Seção 1: Secret na URL (Query Parameter)

### Oficial AbacatePay:
```
URL chamada com query string:
https://seu-dominio.com/webhook/abacatepay?webhookSecret=seu_secret_aqui
```

### Seu Projeto:
```typescript
// Atual (supabase/functions/abacatepay-webhook/index.ts)
const validateWebhookSecret = (req: Request): boolean => {
  const secret = req.headers.get("X-Webhook-Secret") || 
                 req.headers.get("x-webhook-secret") ||
                 req.headers.get("Authorization")?.replace("Bearer ", "");
  
  // ❌ NÃO está verificando query string!
  return secret === webhookSecret;
};
```

### ✅ Correção Necessária:
```typescript
const validateWebhookSecret = (req: Request): boolean => {
  // 1. Tentar query string PRIMEIRO (método oficial)
  const url = new URL(req.url);
  const secretFromUrl = url.searchParams.get("webhookSecret");
  
  // 2. Fallback para headers (seu método adicional)
  const secretFromHeader = req.headers.get("X-Webhook-Secret") || 
                          req.headers.get("x-webhook-secret");
  
  const secret = secretFromUrl || secretFromHeader;
  
  if (!secret) {
    console.warn("⚠️ Webhook sem secret");
    return false;
  }

  return secret === webhookSecret;
};
```

---

## 🔴 Seção 2: Assinatura HMAC SHA256 (CRÍTICO!)

### Oficial AbacatePay:
```
Header: X-Webhook-Signature: <base64-encoded-hmac>
Algoritmo: HMAC-SHA256
Chave: Public key do AbacatePay
Body: RAW (não modificado)
```

### Seu Projeto:
```typescript
// ❌ NÃO implementado!
// Seu código não valida X-Webhook-Signature
```

### ✅ Implementação Necessária:

**Dentro de `supabase/functions/abacatepay-webhook/index.ts`:**

```typescript
import crypto from "https://deno.land/std@0.110.0/crypto/mod.ts";

// Public key do AbacatePay (da documentação)
const ABACATEPAY_PUBLIC_KEY = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNH..."; // Completa na docs

/**
 * Verifica assinatura HMAC-SHA256
 * @param rawBody Corpo RAW (antes de JSON parse)
 * @param signatureFromHeader Valor de X-Webhook-Signature
 * @returns true se válido
 */
function verifyAbacateSignature(rawBody: string, signatureFromHeader: string): boolean {
  try {
    // 1. Converter body em bytes UTF-8
    const bodyBuffer = new TextEncoder().encode(rawBody);
    
    // 2. Calcular HMAC-SHA256
    const keyBuffer = new TextEncoder().encode(ABACATEPAY_PUBLIC_KEY);
    const hmac = new crypto.Hmac("sha256");
    hmac.update(bodyBuffer, "utf8");
    const calculatedSig = hmac.toString("base64");
    
    // 3. Comparação timing-safe
    const expectedBytes = new TextEncoder().encode(calculatedSig);
    const receivedBytes = new TextEncoder().encode(signatureFromHeader);
    
    // Simples comparação (Deno não tem crypto.timingSafeEqual)
    // ⚠️ Não é 100% timing-safe, mas melhor que nada
    return calculatedSig === signatureFromHeader;
  } catch (error) {
    console.error("Erro ao verificar assinatura HMAC:", error);
    return false;
  }
}

// Usar no handler:
serve(async (req) => {
  // ❌ PROBLEMA: Já fizemos JSON parse antes!
  // Precisa ler raw body ANTES de qualquer processamento
  
  // ✅ Solução: Ler raw body ao chegar
  const rawBody = await req.text();
  
  // Validar assinatura HMAC
  const signature = req.headers.get("x-webhook-signature");
  if (!signature || !verifyAbacateSignature(rawBody, signature)) {
    console.error("❌ Assinatura HMAC inválida!");
    await logWebhook("INVALID_SIGNATURE", "", {}, "401", "Assinatura HMAC inválida");
    return new Response("Unauthorized", { status: 401 });
  }
  
  // DEPOIS fazer JSON parse
  const body = JSON.parse(rawBody);
  
  // ... resto do código
});
```

---

## 🔴 Seção 3: Leitura do Raw Body (Dependência de HMAC)

### Problema Atual:
```typescript
// Atual (linha ~110):
const body = await req.json();  // ❌ Já faz parsing!

// Depois tenta validar assinatura, mas body já foi modificado
```

### Solução:
```typescript
// Correto:
serve(async (req) => {
  // 1. PRIMEIRO: Ler raw body (não modificado)
  const rawBody = await req.text();
  
  // 2. SEGUNDO: Validar assinatura HMAC com raw body
  const signature = req.headers.get("x-webhook-signature");
  if (!verifyAbacateSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }
  
  // 3. TERCEIRO: Parse JSON DEPOIS de validar
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  
  // Agora usar body com segurança
  const { event, data } = body;
});
```

---

## 🔴 Seção 4: Idempotência e ID Único

### Oficial AbacatePay:
```json
{
  "id": "log_12345abcdef",          // ← ID ÚNICO por evento
  "event": "billing.paid",
  "data": { ... }
}
```

**Recomendação:** Processar cada `id` uma única vez para evitar duplicatas

### Seu Projeto:
```typescript
// ❌ NÃO verifica se já processou este ID!
// Se o webhook for disparado 2x (retry), vai processar 2x

// Pode causar:
// • Pagamento duplicado
// • Email duplicado
// • Inconsistência de dados
```

### ✅ Implementação Necessária:

**1. Criar tabela para rastrear:**
```sql
CREATE TABLE IF NOT EXISTS webhook_processing (
  id TEXT PRIMARY KEY,                        -- webhook.id
  event TEXT NOT NULL,                        -- webhook.event
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'processed',            -- 'processed', 'failed'
  error_message TEXT
);

CREATE INDEX idx_webhook_processed ON webhook_processing(event, processed_at);
```

**2. Checar antes de processar:**
```typescript
const handleWebhook = async (webhookId: string, event: string) => {
  // Verificar se já processou
  const { data: existing } = await supabase
    .from("webhook_processing")
    .select("id")
    .eq("id", webhookId)
    .limit(1)
    .maybeSingle();
  
  if (existing) {
    console.log(`⏭️ Webhook ${webhookId} já foi processado`);
    return new Response("Already processed", { status: 200 }); // Retorna 200 (OK)
  }
  
  try {
    // ✅ Processar evento
    // ... seu código
    
    // 3. Marcar como processado
    await supabase.from("webhook_processing").insert({
      id: webhookId,
      event: event,
      status: "processed"
    });
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    // Se falhar, marcar como falha MAS NÃO retroceder inserts
    await supabase.from("webhook_processing").insert({
      id: webhookId,
      event: event,
      status: "failed",
      error_message: error.message
    });
    
    return new Response("Processing error", { status: 500 });
  }
};
```

---

## ⚠️ Seção 5: Campo devMode (Ambiente)

### Oficial AbacatePay:
```json
{
  "devMode": false,  // true em testes, false em produção
  "event": "billing.paid",
  "data": { ... }
}
```

### Seu Projeto:
```typescript
// ❌ NÃO verifica devMode
// Pode processar eventos de teste como se fossem reais
```

### ✅ Implementação Recomendada:

```typescript
const { event, data, devMode } = body;

if (devMode) {
  console.log("ℹ️ Webhook de DESENVOLVIMENTO (teste)");
  // Decidir: processar ou ignorar eventos de teste
  
  // Opção A: Ignorar eventos de teste
  if (Deno.env.get("ENVIRONMENT") === "production") {
    console.log("⏭️ Ignorando evento de desenvolvimento em produção");
    return new Response(JSON.stringify({ received: true, skipped: true }), { status: 200 });
  }
  
  // Opção B: Processar tudo (mais permissivo)
}

// Continuar processando
```

---

## ⚠️ Seção 6: Ambientes Separados Dev/Prod

### Oficial AbacatePay:
```
Dashboard AbacatePay tem 2 ambientes:
• DEV MODE (testes)
• PRODUCTION (dados reais)

Devem ter webhooks SEPARADOS!
```

### Seu Projeto:
```
Possível problema:
• Mesma URL recebendo ambos?
• Precisa criar 2 webhooks:
  - https://.../functions/v1/abacatepay-webhook (DEV)
  - https://.../functions/v1/abacatepay-webhook (PROD)
  
OU usar query parameter para diferenciar:
  - https://.../functions/v1/abacatepay-webhook?env=dev
  - https://.../functions/v1/abacatepay-webhook?env=prod
```

### ✅ Recomendação:
```typescript
serve(async (req) => {
  const url = new URL(req.url);
  const env = url.searchParams.get("env") || "production";
  
  // Processar de acordo com ambiente
  const isDevMode = env === "dev";
  
  // Validar que devMode no payload bate com URL
  if (isDevMode && !body.devMode) {
    console.warn("⚠️ URL é dev mas webhook é de produção!");
  }
  
  // ...
});
```

---

## 📋 Resumo de Melhorias Necessárias (Por Prioridade)

### 🔴 CRÍTICO (Segurança)
1. **Implementar HMAC-SHA256** (oficial recomenda)
   - Arquivo: `supabase/functions/abacatepay-webhook/index.ts`
   - Adicionar: `verifyAbacateSignature()` function
   - Usar: Public key do AbacatePay

2. **Validar Raw Body** (dependência de HMAC)
   - Ler corpo ANTES de JSON parse
   - Usar para verificar assinatura

3. **Adicionar Secret na URL** (oficial suporta)
   - Além de header, também aceitar query parameter

### 🟡 IMPORTANTE (Confiabilidade)
4. **Implementar Idempotência**
   - Criar tabela: `webhook_processing`
   - Verificar: cada webhook.id processado uma vez
   - Evitar: duplicatas de pagamento/email

5. **Verificar devMode**
   - Decidir: processar eventos de teste?
   - Configurável por ambiente

### 🟢 BOM TER (Operacional)
6. **Webhooks Separados Dev/Prod**
   - Criar 2 webhooks no AbacatePay
   - OU usar query parameter para diferenciar

---

## 🔄 Payload Esperado Oficial

### Modelo Correto (Billing):
```json
{
  "id": "log_12345abcdef",
  "event": "billing.paid",
  "devMode": false,
  "data": {
    "payment": {
      "amount": 1000,
      "fee": 80,
      "method": "PIX"
    },
    "pixQrCode": {
      "id": "pix_char_...",
      "amount": 1000,
      "kind": "PIX",
      "status": "PAID"
    }
  }
}
```

### Seu Payload Esperado (Atual):
```json
{
  "event": "billing.paid",
  "data": {
    "billing": {
      "id": "ABC123",
      "status": "paid"
    }
  }
}
```

**⚠️ Diferença:** Oficial tem `payment` e `pixQrCode`, você espera `billing`

**Ação:** Verificar qual é o payload real do AbacatePay

---

## ✅ Próximos Passos

1. [ ] Ler payload real do AbacatePay (testar)
2. [ ] Implementar HMAC-SHA256
3. [ ] Implementar idempotência (webhook_processing table)
4. [ ] Adicionar suporte a secret na URL
5. [ ] Validar devMode
6. [ ] Testar com webhook de teste do AbacatePay
7. [ ] Fazer pagamento real para validar

---

**Data:** 23 de Fevereiro de 2026
**Fonte:** Comparação entre AbacatePay Oficial e Implementação Atual
**Status:** 🔴 Melhorias Críticas Necessárias
