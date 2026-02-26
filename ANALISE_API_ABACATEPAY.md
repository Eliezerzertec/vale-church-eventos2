# 📚 Análise Técnica - Integração AbacatePay API

## ✅ Baseado na Documentação Oficial

Fonte: https://docs.abacatepay.com

---

## 1️⃣ Endpoints Principais

### POST `/billing/create`
**Cria uma cobrança (pagamento)**

Request:
```json
{
  "frequency": "ONE_TIME",
  "methods": ["PIX", "CARD"],
  "products": [
    {
      "externalId": "evento_123",
      "name": "Inscrição - Evento X",
      "price": 100000  // em centavos (R$ 1000.00)
    }
  ],
  "returnUrl": "https://seu-site.com/eventos/123",
  "completionUrl": "https://seu-site.com/eventos/123?pagamento=ok",
  "customer": {
    "metadata": {
      "email": "user@example.com",
      "name": "João Silva",
      "cellphone": "11999999999",
      "taxId": "12345678901"
    }
  }
}
```

Response:
```json
{
  "data": {
    "id": "bill_6QtgLTffTYgRQ0FJQuRTh3Wu",     // ← Billing ID (transaction ID)
    "url": "https://abacatepay.com/pay/bill_6QtgLTffTYgRQ0FJQuRTh3Wu",
    "amount": 100000,
    "status": "PENDING",
    "devMode": true,
    "methods": ["PIX", "CARD"],
    "frequency": "ONE_TIME",
    "customer": {...},
    "createdAt": "2024-11-04T18:38:28.573Z",
    "updatedAt": "2024-11-04T18:38:28.573Z"
  },
  "error": null
}
```

---

### GET `/billing/{id}`
**Busca status de uma cobrança**

```bash
GET https://api.abacatepay.com/v1/billing/bill_6QtgLTffTYgRQ0FJQuRTh3Wu
Authorization: Bearer abc_dev_wsc2xLB4mS4cjj2LX3DUryzY
```

Response (quando status = PAID):
```json
{
  "data": {
    "id": "bill_6QtgLTffTYgRQ0FJQuRTh3Wu",
    "status": "PAID",
    "amount": 100000,
    "devMode": true,
    "methods": ["PIX", "CARD"],
    "updatedAt": "2024-11-04T19:00:00.000Z"
  },
  "error": null
}
```

---

## 2️⃣ Possíveis Status

| Status | Significado | Ação |
|--------|------------|------|
| `PENDING` | Aguardando pagamento | Exibir link de checkout |
| `PAID` | ✅ Pagamento confirmado | Gerar recibo |
| `FAILED` | ❌ Pagamento falhou | Permitir nova tentativa |
| `REFUNDED` | Reembolsado | Informar ao usuário |
| `EXPIRED` | Link expirou | Criar novo link |
| `CANCELLED` | Cancelado | Oferecer reinscrição |

---

## 3️⃣ URL do Recibo (Receipt)

**Formato**: `https://app.abacatepay.com/receipt/{transaction_id}`

Onde `transaction_id` = `billing.id`

Exemplo com dados reais do usuário:
```
https://app.abacatepay.com/receipt/tran_6QtgLTffTYgRQ0FJQuRTh3Wu
```

---

## 4️⃣ Webhooks para Confirmação em Tempo Real

**Evento**: `billing.paid`

AbacatePay envia um webhook automaticamente quando um pagamento é confirmado:

```json
POST /api/webhooks/abacatepay?webhookSecret=seu_secret
Content-Type: application/json

{
  "id": "log_12345abcdef",
  "event": "billing.paid",
  "data": {
    "payment": {
      "amount": 100000,
      "fee": 2000,
      "method": "PIX"
    },
    "pixQrCode": {
      "id": "pix_char_mXTWdj6sABWnc4uL2Rh1r6tb",
      "status": "PAID"
    }
  },
  "devMode": true
}
```

---

## 5️⃣ Validação de Webhook (Segurança)

Dois níveis de validação obrigatória:

### Nível 1: Secret na Query String
```javascript
const secret = req.query.webhookSecret;
if (secret !== process.env.WEBHOOK_SECRET) {
  return res.status(401).json({ error: 'Invalid' });
}
```

### Nível 2: Assinatura HMAC no Header
```javascript
import crypto from 'crypto';

const ABACATEPAY_PUBLIC_KEY = 'sua_chave_publica';
const signature = req.headers['x-webhook-signature'];

function verifyAbacateSignature(rawBody, signatureHeader) {
  const expectedSig = crypto
    .createHmac('sha256', ABACATEPAY_PUBLIC_KEY)
    .update(rawBody)
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSig),
    Buffer.from(signatureHeader)
  );
}
```

---

## 6️⃣ Autenticação

Todas as requisições requerem Bearer token no header:

```bash
curl -X GET https://api.abacatepay.com/v1/billing/bill_123 \
  -H "Authorization: Bearer abc_dev_wsc2xLB4mS4cjj2LX3DUryzY"
```

---

## 7️⃣ Comparar com Nosso Código

### ✅ O Que Está Correto

1. **POST /billing/create**: Estamos implementando corretamente
2. **Bearer token**: Usando corretamente no backend
3. **Dados do cliente**: Mapeando nome, email, CPF corretamente
4. **Receipt URL**: Usando pattern `https://app.abacatepay.com/receipt/{billing.id}`

### ❌ O Que Falta

1. **GET /billing/{id}**: Podemos usar para confirmar status (alternativa aos webhooks)
2. **Webhooks**: Não temos endpoint para receber confirmações em tempo real
3. **HMAC validation**: Estamos usando apenas secret na URL

---

## 8️⃣ Fluxo Correto (do Erro 400)

O erro 400 acontece porque:

1. **Cliente tenta SELECT**: `receipt_url, billing_id, payment_method` 
2. **Mas colunas não existem** na tabela `payments`
3. **RLS bloqueava** por ser SELECT sem auth

### Solução:

1. ✅ Criar colunas no DB (feito)
2. ✅ Corrigir RLS policies (feito)
3. ✅ Armazenar `receipt_url` quando criar billing (feito no server.js)
4. ✅ Buscar ao confirmar pagamento (feito no EventDetailPage.tsx)
5. ✅ Exibir no comprovante (feito no PaymentReceipt.tsx)

---

## 🎯 Recomendação Final

**Usar 2 estratégias em paralelo:**

1. **Polling (Atual)**: 
   - Usuario completa pagamento
   - Retorna a `/eventos/{id}?pagamento=ok`
   - Frontend faz GET na tabela `payments` para buscar status
   - ✅ Funciona sem webhook

2. **Webhooks (Futuro - Mais robusto)**:
   - AbacatePay envia confirmação para nosso backend
   - Backend atualiza banco de dados
   - Frontend sempre vê dados mais atualizados
   - ✅ Síncrono, confiável, em tempo real

---

## 📞 Referências

- Docs: https://docs.abacatepay.com
- Webhooks: https://docs.abacatepay.com/pages/webhooks
- Autenticação: https://docs.abacatepay.com/pages/authentication
