# 📚 Integração AbacatePay - Guia Definitivo

## 🎯 Resumo da API

A integração com AbacatePay segue este fluxo:

```
1. Frontend → POST /api/payment/create → Backend
2. Backend → POST /billing/create → AbacatePay API
3. AbacatePay → URL de checkout → Usuario
4. Usuario paga (PIX/CARD)
5. AbacatePay → Webhook → Backend
6. Backend → Atualiza DB → Frontend realtime
```

---

## 🔑 Requisitos

### 1. API Key (Obrigatório)
```env
# Produção
VITE_ABACATEPAY_KEY=abc_prod_S1DZarn5zgPxuxSndzzT4FNR

# Desenvolvimento
VITE_ABACATEPAY_KEY=abc_dev_wsc2xLB4mS4cjj2LX3DUryzY
```

### 2. Webhook Secret (Para validar requisições)
```env
ABACATEPAY_WEBHOOK_SECRET=qwe123123
```

---

## 📡 Endpoint Principal: POST /billing/create

### Request Format

```javascript
{
  "frequency": "ONE_TIME",        // ou MONTHLY, YEARLY
  "methods": ["PIX", "CARD"],     // Métodos aceitos
  "products": [                    // Produtos/itens
    {
      "externalId": "evento-123",  // ID único do seu sistema
      "name": "Inscrição - Culto",  // Nome visível ao usuário
      "description": "...",        // Descrição (opcional)
      "quantity": 1,               // Quantidade
      "price": 10000               // Preço em CENTAVOS (R$ 100.00 = 10000)
    }
  ],
  "returnUrl": "https://...",      // URL para voltar após pagar
  "completionUrl": "https://...",  // URL de conclusão
  "customer": {                    // Dados do cliente
    "name": "João Silva",
    "email": "joao@example.com",
    "cellphone": "11999999999",    // ✅ Obrigatório
    "taxId": "12345678901"         // ✅ Obrigatório (CPF ou CNPJ válido)
  },
  "couponId": "COUPON-CODE"        // Opcional
}
```

### Response Format

```javascript
{
  "data": {
    "id": "bill_6QtgLTffTYgRQ0FJQuRTh3Wu",    // ID da cobrança
    "url": "https://pay.abacatepay.com/...",  // Link para pagamento
    "status": "PENDING",                      // Status atual
    "amount": 10000,                          // Valor em centavos
    "methods": ["PIX", "CARD"],
    "frequency": "ONE_TIME",
    "devMode": true,
    "createdAt": "2024-11-04T18:38:28.573Z",
    "updatedAt": "2024-11-04T18:38:28.573Z"
  },
  "error": null
}
```

---

## 📊 Status Possíveis

| Status | Significado | Ação |
|--------|------------|------|
| `PENDING` | 🕐 Aguardando pagamento | Mostrar link de checkout |
| `PAID` | ✅ Pagamento confirmado | Gerar recibo, confirmar inscrição |
| `FAILED` | ❌ Pagamento falhou | Permitir nova tentativa |
| `REFUNDED` | 💰 Reembolsado | Informar ao usuário |
| `EXPIRED` | ⏰ Link expirou | Criar novo link |
| `CANCELLED` | 🚫 Cancelado | Oferecer reinscrição |

---

## 🔐 Autenticação

**Padrão Bearer Token**

```javascript
fetch('https://api.abacatepay.com/v1/billing/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer abc_prod_S1DZarn5zgPxuxSndzzT4FNR`
  },
  body: JSON.stringify({ /* payload */ })
})
```

**Base URL:**
- Produção: `https://api.abacatepay.com/v1`
- Dev: Same URL (diferencia por API Key)

---

## 📮 Webhooks - Confirmação em Tempo Real

### Endpoint Receptor
```
POST /functions/v1/abacatepay-webhook?webhookSecret=qwe123123
Authorization: Bearer <token>
X-Webhook-Secret: qwe123123
```

### Payload Recebido

```javascript
{
  "id": "log_12345abcdef",
  "event": "billing.paid",
  "data": {
    "billing": {
      "id": "bill_6Qt...",
      "status": "PAID",
      "amount": 10000,
      "externalId": "evento-123"
    },
    "payment": {
      "id": "pix_xyz",
      "method": "PIX",
      "paidAt": "2024-11-04T19:00:00Z"
    },
    "pixQrCode": {
      "id": "pix_char_...",
      "status": "PAID"
    }
  },
  "devMode": false
}
```

### Fluxo de Processamento

```javascript
1. Receber webhook
   ↓
2. Validar secret (query param)
   ↓
3. Validar assinatura HMAC
   ↓
4. Buscar pagamento pelo billing_id
   ↓
5. Atualizar status em payments table
   ↓
6. Se status = 'PAID':
   - Confirmar inscrição (event_registrations → status: 'confirmed')
   - Enviar email de confirmação
   - Atualizar timestamp de pagamento
   ↓
7. Retornar { success: true }
```

---

## 🎁 Cupons/Desconto

### Aplicar Cupom
```javascript
{
  ...payload,
  "couponId": "DESCONTO10"  // Código do cupom (STRING)
}
```

**Nota:** AbacatePay aplicará o desconto automaticamente se o cupom for válido.

---

## 🧪 Dados para Teste

### CPF Válido para Testes
```
11144477735  // Passa na validação de CPF
```

### Cartão Teste
```
Número: 4111 1111 1111 1111
Validade: Qualquer data futura
CVV: 123
```

### PIX Teste
AbacatePay fornece QR Code de teste que pode ser escaneado sem processar real.

---

## 🚨 Erros Comuns

### Erro 400: "Invalid taxId"
**Causa:** CPF inválido ou formato incorreto
**Solução:** Usar CPF válido (11144477735 para testes)

### Erro 422: "Expected property 'customer.cellphone'"
**Causa:** Campo obrigatório ausente
**Solução:** Adicionar `cellphone` e `taxId` no objeto customer

### Erro 401: "Invalid API key"
**Causa:** Chave API incorreta ou expirada
**Solução:** Verificar `.env` com a chave correta

### CORS Error
**Causa:** Frontend chamando direto (sem proxy backend)
**Solução:** Usar `/api/payment/create` do backend (localhost:3001)

---

## ✅ Checklist de Implementação

### Backend (server.js)
- [x] Carregar VITE_ABACATEPAY_KEY do .env via dotenv
- [x] POST /api/payment/create recebe body com payload
- [x] Validar que body possui todos campos obrigatórios
- [x] Chamar `fetch()` para AbacatePay API com Bearer token
- [x] Retornar response normalizando `data/error`
- [x] Salvar billing_id no banco de dados

### Frontend (client.ts)
- [x] Usar backend proxy em development
- [x] Chamar direto AbacatePay em production
- [x] Passar correto headers de autenticação
- [x] Normalizar resposta para `{ data, error }`
- [x] Extrair checkout URL de múltiplas variações (url, paymentUrl, checkoutUrl)

### Banco de Dados
- [x] Tabela `payments` com colunas:
  - `billing_id` (TEXT) ← ID retornado pela API
  - `payment_method` (TEXT) ← PIX, CARD
  - `receipt_url` (TEXT) ← URL do recibo
  - Status: pending, paid, failed

### Webhook (Supabase Functions)
- [x] Endpoint `/abacatepay-webhook?webhookSecret=...`
- [x] Validar secret na query string
- [x] Receber `billing.id` e `billing.status`
- [x] Atualizar payments table
- [x] Confirmar inscrição se status = PAID
- [x] Enviar email de confirmação

### Frontend (PaymentConfirmationPage)
- [x] Receber `registration_id` e `billing_id` como params
- [x] Buscar dados de pagamento do Supabase
- [x] Usar realtime listener para atualizar quando webhook confirma
- [x] Mostrar comprovante com dados do pagamento
- [x] Exibir página de agradecimento quando confirmado

---

## 🔗 Referências

| Recurso | Link |
|---------|------|
| Docs Oficiais | https://docs.abacatepay.com |
| Webhooks | https://docs.abacatepay.com/pages/webhooks |
| Autenticação | https://docs.abacatepay.com/pages/authentication |
| Teste de API | https://api.abacatepay.com/docs |

---

## 🎬 Próximas Ações

1. **Aceitar um exemplo de evento** (ID real do BD)
2. **Testar fluxo completo** com `node test-payment-flow.js`
3. **Verificar console** do navegador e backend para logs
4. **Testar webhook** enviando manualmente um POST
5. **Gerar comprovante** PDF quando confirmado (opcional)

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique `ANALISE_API_ABACATEPAY.md` para aprofundar
2. Execute `node test-payment-flow.js` para testar
3. Revise logs no console do navegador (`F12`)
4. Revise logs do backend (`npm run dev:backend`)
5. Acesse dashboard.abacatepay.com para ver transações reais
