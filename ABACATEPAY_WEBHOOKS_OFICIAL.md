# 📖 Documentação Oficial AbacatePay - Webhooks

**Fonte:** https://docs.abacatepay.com/pages/webhooks

---

## 🏗️ Estrutura Oficial

### Configuração Básica

**Campos obrigatórios:**
1. **Nome** - Identificador único para seu webhook
   - Exemplo: "Notificações de Pagamento"

2. **URL** - Endpoint HTTPS que receberá as notificações
   - Deve usar HTTPS (não HTTP)
   - Exemplo: `https://seu-dominio.com/webhook/abacatepay`

3. **Secret** - Chave secreta para validar requisições
   - Configurar um secret único para cada webhook
   - Validar em TODAS as requisições recebidas

---

## 🔐 Segurança: 2 Camadas de Autenticação

### Camada 1: Secret na URL (Autenticação Simples)

**Como funciona:**
```
URL base do webhook:
https://seu-dominio.com/webhook/abacatepay

AbacatePay chama com secret na query string:
https://seu-dominio.com/webhook/abacatepay?webhookSecret=seu_secret_aqui
```

**Validação (Express.js):**
```javascript
app.post('/webhook/abacatepay', (req, res) => {
  // 1. Extrair secret da URL
  const webhookSecret = req.query.webhookSecret;
  
  // 2. Validar contra variável de ambiente
  if (webhookSecret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  // 3. Processar evento
  const event = req.body;
  console.log('Received webhook:', event);
  
  res.status(200).json({ received: true });
});
```

---

### Camada 2: Assinatura HMAC SHA256 (Integridade do Corpo)

**Como funciona:**
- AbacatePay envia assinatura em header: `X-Webhook-Signature`
- Assinatura = HMAC-SHA256 do body raw
- Valida que o corpo NÃO foi modificado em trânsito

**Public Key do AbacatePay:**
```
t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNH...
(chave completa na documentação)
```

**Validação TypeScript:**
```typescript
import crypto from "node:crypto";

const ABACATEPAY_PUBLIC_KEY = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC...";

/**
 * Verifies if the webhook signature matches the expected HMAC.
 * @param rawBody Raw request body string (ANTES de parse JSON)
 * @param signatureFromHeader The signature from X-Webhook-Signature header
 * @returns true if valid, false otherwise
 */
export function verifyAbacateSignature(rawBody: string, signatureFromHeader: string) {
  // 1. Converter body em buffer (UTF-8)
  const bodyBuffer = Buffer.from(rawBody, "utf8");

  // 2. Calcular esperado HMAC-SHA256
  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(bodyBuffer)
    .digest("base64");

  // 3. Comparar com timing-safe (não vulnerável a timing attacks)
  const A = Buffer.from(expectedSig);
  const B = Buffer.from(signatureFromHeader);

  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

// Uso em Express:
app.post('/webhook/abacatepay', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const rawBody = req.rawBody; // Lê ANTES do JSON parse
  
  if (!verifyAbacateSignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Processar evento
  res.status(200).json({ received: true });
});
```

**⚠️ Importante:**
- Ler o corpo RAW da requisição ANTES de qualquer middleware que faça parsing
- Usar exatamente os mesmos bytes recebidos ao calcular HMAC
- Não pode modificar o corpo antes de verificar a assinatura

---

## 📡 Eventos Suportados (3 tipos)

### 1. `billing.paid` - Pagamento Confirmado

**Disparo:** Quando um pagamento é confirmado

**Payload (PIX QR Code):**
```json
{
  "id": "log_12345abcdef",
  "event": "billing.paid",
  "devMode": false,
  "data": {
    "payment": {
      "amount": 1000,           // em centavos (R$ 10,00)
      "fee": 80,                // taxa cobrada
      "method": "PIX"           // PIX ou CARD
    },
    "pixQrCode": {
      "id": "pix_char_mXTWdj6sABWnc4uL2Rh1r6tb",
      "amount": 1000,
      "kind": "PIX",
      "status": "PAID"
    }
  }
}
```

**Payload (Cobranças/Billing):**
```json
{
  "id": "log_12345abcdef",
  "event": "billing.paid",
  "devMode": false,
  "data": {
    "billing": {
      "id": "bill_123456",
      "status": "PAID",
      "amount": 5000,           // em centavos
      "fee": 100
    }
  }
}
```

---

### 2. `withdraw.done` - Saque Concluído

**Disparo:** Quando um saque é concluído com sucesso

**Payload:**
```json
{
  "id": "log_12345abcdef",
  "event": "withdraw.done",
  "devMode": false,
  "data": {
    "transaction": {
      "id": "tran_123456",
      "status": "COMPLETE",
      "kind": "WITHDRAW",
      "amount": 5000,
      "platformFee": 80,
      "externalId": "withdraw-1234",
      "receiptUrl": "https://abacatepay.com/receipt/tran_123456",
      "createdAt": "2025-03-24T21:50:20.772Z",
      "updatedAt": "2025-03-24T21:55:20.772Z"
    }
  }
}
```

---

### 3. `withdraw.failed` - Saque Falhou

**Disparo:** Quando um saque não é concluído

**Payload:**
```json
{
  "id": "log_12345abcdef",
  "event": "withdraw.failed",
  "devMode": false,
  "data": {
    "transaction": {
      "id": "tran_789012",
      "status": "CANCELLED",
      "kind": "WITHDRAW",
      "amount": 3000,
      "platformFee": 0,
      "externalId": "withdraw-5678",
      "receiptUrl": "https://abacatepay.com/receipt/tran_789012",
      "createdAt": "2025-03-24T22:00:20.772Z",
      "updatedAt": "2025-03-24T22:05:20.772Z"
    }
  }
}
```

---

## 🌍 Ambientes (Dev vs Produção)

**Campo `devMode` no payload:**
- `true` = Evento do ambiente de DESENVOLVIMENTO (testes)
- `false` = Evento da PRODUÇÃO (dados reais)

**Configuração no AbacatePay:**
- Webhooks em Dev Mode → recebem notificações apenas de testes
- Webhooks em Produção → recebem notificações apenas de dados reais

**Recomendação:** Ter 2 webhooks separados (um dev, um prod)

---

## 💰 Notas Sobre Valores

- **Todos os valores monetários são em CENTAVOS**
  - 1000 = R$ 10,00
  - 5000 = R$ 50,00

- **Campo `fee`** = Taxa cobrada pela AbacatePay
  - Exemplo: amount=1000, fee=80 → você recebe R$ 9,20

---

## ✅ Boas Práticas Oficiais

1. **Validação em 2 camadas**
   - [ ] Secret na URL
   - [ ] Assinatura HMAC no header

2. **Idempotência**
   - [ ] Cada webhook tem `id` único
   - [ ] Processar cada `id` uma única vez
   - [ ] Guardar IDs processados em banco

3. **Tratamento de Erros**
   - [ ] Implementar retry logic
   - [ ] Lida com falhas temporárias
   - [ ] Registrar todas as falhas

4. **Respostas HTTP**
   - [ ] `2xx` = Sucesso (webhook processado)
   - [ ] `4xx` = Erro que não deve fazer retry
   - [ ] `5xx` = Erro que deve fazer retry

5. **Monitoramento**
   - [ ] Registrar falhas de verificação
   - [ ] Alertar se muitos webhooks falharem
   - [ ] Ter endpoint para consultar status

6. **HTTPS Obrigatório**
   - [ ] URL do webhook deve ser HTTPS
   - [ ] Certificado SSL válido
   - [ ] Não aceitar HTTP

---

## 🔄 Fluxo Recomendado

```
1. AbacatePay dispara webhook
   ↓
2. Seu servidor recebe POST em webhook URL
   ↓
3. Validar Secret (query string)
   ↓
4. Validar Assinatura HMAC (header)
   ↓
5. Verificar se já processou este ID
   ↓
6. Processar evento:
   - Atualizar dados no banco
   - Enviar email
   - Notificar outro sistema
   ↓
7. Marcar ID como processado
   ↓
8. Responder com 200 OK
```

---

## 📋 Criar Webhook no Dashboard

**Passos:**
1. AbacatePay Dashboard
2. Seção de Webhooks
3. Clique "Criar" ou "Novo Webhook"
4. Preencha:
   - **Nome:** Ex: "Notificações de Pagamento"
   - **URL:** Ex: `https://seu-dominio.com/webhook/abacatepay`
   - **Secret:** Crie um valor único (ex: `sua_chave_secreta_123`)
5. Selecione eventos:
   - ☑ `billing.paid`
   - ☐ `withdraw.done`
   - ☐ `withdraw.failed`
6. Clique "Salvar"

---

## 🚀 Test/Debug

**Enviar teste do dashboard:**
```
AbacatePay Dashboard
  → Webhooks
  → [Seu webhook]
  → "Testar" ou "Send Test"
```

Você deve receber um POST com payload de exemplo

---

## 📞 Contato

Se precisar de ajuda:
- Email: `ajuda@abacatepay.com`
- Documentação: https://docs.abacatepay.com

---

**Data:** 23 de Fevereiro de 2026
**Fonte Oficial:** AbacatePay Webhooks API
**Status:** Informações Colhidas com Sucesso ✅
