# 🔌 Endpoints do Backend - Documentação Completa

## Base URL
```
http://localhost:3001
```

---

## 📋 Sumário Rápido

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/payment/create` | Criar pagamento/cobrança |
| GET | `/api/coupons/list` | Listar cupons disponíveis |
| GET | `/api/coupon/validate/:code` | Validar cupom |
| GET | `/api/payment/:billingId` | Verificar status de pagamento |
| GET | `/api/webhook/logs` | Monitor webhooks (último 50) |

---

## 🔐 Endpoints de Pagamento

### 1. POST `/api/payment/create`
**Criar uma nova cobrança no AbacatePay**

#### Request
```bash
curl -X POST http://localhost:3001/api/payment/create \
  -H "Content-Type: application/json" \
  -d {
    "amount": 99.90,
    "registrationId": "reg_123",
    "registrationEmail": "user@example.com",
    "registrationName": "João Silva",
    "couponId": "cupom_5percent"
  }
```

#### Body Parameters
| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| amount | number | Valor em reais | 99.90 |
| registrationId | string | ID do registro | "reg_123" |
| registrationEmail | string | Email do usuário | "user@example.com" |
| registrationName | string | Nome do usuário | "João Silva" |
| couponId | string (opt) | ID do cupom para desconto | "cupom_5percent" |
| eventId | number (opt) | ID do evento | 1 |

#### Response (200 OK)
```json
{
  "error": null,
  "data": {
    "id": "bill_abc123def456",
    "status": "pending",
    "amount": 99.90,
    "pix": {
      "qrCode": "00020126360014...",
      "copyPaste": "00020126360014br.gov.bcb.pix..."
    },
    "payment_url": "https://payment.abacatepay.com/...",
    "receipt_url": "https://payment.abacatepay.com/receipt/...",
    "message": "Cobrança criada com sucesso"
  }
}
```

#### Response (400 Bad Request)
```json
{
  "error": "Invalid coupon",
  "data": null
}
```

#### Exemplos Práticos

**Pagamento simples (sem cupom):**
```bash
curl -X POST http://localhost:3001/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "registrationId": "reg_abc123",
    "registrationEmail": "joao@example.com",
    "registrationName": "João da Silva"
  }'
```

**Pagamento com cupom:**
```bash
curl -X POST http://localhost:3001/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 85.00,
    "registrationId": "reg_abc123",
    "registrationEmail": "joao@example.com",
    "registrationName": "João da Silva",
    "couponId": "cupom_10percent"
  }'
```

---

## 🎁 Endpoints de Cupons

### 2. GET `/api/coupons/list`
**Listar todos os cupons disponíveis**

#### Request
```bash
curl http://localhost:3001/api/coupons/list
```

#### Response (200 OK)
```json
{
  "error": null,
  "data": [
    {
      "id": "cupom_5percent",
      "description": "Desconto de 5%",
      "discount": 5,
      "discountKind": "PERCENTAGE",
      "active": true
    },
    {
      "id": "cupom_10reais",
      "description": "Desconto de R$ 10",
      "discount": 10,
      "discountKind": "FIXED",
      "active": true
    }
  ],
  "total": 2
}
```

#### Response (Error)
```json
{
  "error": "Failed to fetch coupons",
  "data": []
}
```

#### Interpretação dos Tipos de Desconto

**PERCENTAGE:**
- Desconto de X%
- Cálculo: `preço * (discount / 100)`
- Exemplo: desconto=5 → 5% de desconto

**FIXED:**
- Desconto fixo de X reais
- Cálculo: `desconto / 100` (em centavos, convertido para reais)
- Exemplo: desconto=1000 → R$ 10 de desconto

---

### 3. GET `/api/coupon/validate/:code`
**Validar um cupom específico**

#### Request
```bash
curl http://localhost:3001/api/coupon/validate/PROMO2025
```

#### Response (200 OK)
```json
{
  "error": null,
  "data": {
    "id": "cupom_10percent",
    "code": "PROMO2025",
    "description": "Desconto de 10%",
    "discount": 10,
    "discountKind": "PERCENTAGE",
    "active": true,
    "expiresAt": "2025-12-31T23:59:59Z",
    "remainingUses": 50,
    "message": "Cupom válido e disponível"
  }
}
```

#### Response (Invalid)
```json
{
  "error": "Invalid coupon: Code not found or expired",
  "data": null
}
```

#### Exemplos Práticos

**Validar cupom comum:**
```bash
curl http://localhost:3001/api/coupon/validate/BLACKFRIDAY
```

**Validar cupom com case-insensitive:**
```bash
curl http://localhost:3001/api/coupon/validate/promo2025
# (convertido para maiúscula automaticamente)
```

---

## 💳 Endpoints de Status de Pagamento

### 4. GET `/api/payment/:billingId`
**Verificar o status de um pagamento**

#### Request
```bash
curl http://localhost:3001/api/payment/bill_abc123def456
```

#### Response (200 OK - Aguardando)
```json
{
  "error": null,
  "data": {
    "id": "bill_abc123def456",
    "status": "pending",
    "amount": 99.90,
    "created_at": "2025-02-23T14:30:00Z",
    "payment_method": null
  }
}
```

#### Response (200 OK - Pago)
```json
{
  "error": null,
  "data": {
    "id": "bill_abc123def456",
    "status": "paid",
    "amount": 99.90,
    "payment_method": "pix",
    "paid_at": "2025-02-23T14:35:42Z",
    "receipt_url": "https://payment.abacatepay.com/receipt/...",
    "transaction_id": "txn_xyz789"
  }
}
```

#### Response (404 Not Found)
```json
{
  "error": "Payment not found",
  "data": null
}
```

#### Estados Possíveis
- `pending` - Aguardando confirmação
- `paid` - Pagamento confirmado
- `failed` - Pagamento falhou
- `expired` - Cobrança expirou

---

## 📊 Endpoints de Monitoramento

### 5. GET `/api/webhook/logs`
**Monitora webhooks recebidos (últimos 50)**

#### Request
```bash
curl http://localhost:3001/api/webhook/logs
```

#### Response (200 OK)
```json
{
  "error": null,
  "data": [
    {
      "id": "log_uuid_1",
      "event": "billing.paid",
      "billing_id": "bill_abc123def456",
      "status": "paid",
      "request_body": {
        "event": "billing.paid",
        "data": {
          "billing": {
            "id": "bill_abc123def456",
            "status": "paid"
          },
          "payment": {
            "method": "pix"
          }
        }
      },
      "response_status": "200",
      "error_message": null,
      "created_at": "2025-02-23T14:35:42.123Z"
    },
    {
      "id": "log_uuid_2",
      "event": "billing.paid",
      "billing_id": "bill_xyz789",
      "status": null,
      "request_body": {...},
      "response_status": "400",
      "error_message": "Payment not found in database",
      "created_at": "2025-02-23T14:34:50.456Z"
    }
  ],
  "total": 2,
  "timestamp": "2025-02-23T14:36:00Z"
}
```

#### Campos Retornados
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único do log |
| event | string | Tipo de evento (ex: "billing.paid") |
| billing_id | string | ID da cobrança AbacatePay |
| status | string | Status do pagamento (paid, pending, etc) |
| request_body | JSON | Payload completo do webhook |
| response_status | string | HTTP status da resposta (200, 400, 500, etc) |
| error_message | string | Mensagem de erro se houver |
| created_at | timestamp | Quando o webhook foi recebido |

#### Análise de Status HTTP
- `200` ✅ Webhook processado com sucesso
- `400` ❌ Webhook inválido ou pagamento não encontrado
- `401` ❌ Secret inválido
- `500` ❌ Erro do servidor

---

## 🧪 Exemplos de Fluxo Completo

### Cenário 1: Pagamento Simples com PIX

```bash
# 1. Criar cobrança
curl -X POST http://localhost:3001/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "registrationId": "reg_123",
    "registrationEmail": "user@example.com",
    "registrationName": "João Silva"
  }'
# Resultado: { "id": "bill_abc", "pix": { "qrCode": "..." } }

# 2. Esperar pagamento (aguarda webhook)
# (webhook dispara automaticamente quando AbacatePay confirma)

# 3. Verificar status
curl http://localhost:3001/api/payment/bill_abc
# Resultado: { "status": "paid" } ou { "status": "pending" }

# 4. Ver webhook recebido
curl http://localhost:3001/api/webhook/logs
# Resultado: evento com response_status: "200"
```

### Cenário 2: Pagamento com Cupom e Desconto

```bash
# 1. Listar cupons disponíveis
curl http://localhost:3001/api/coupons/list
# Resultado: [{ "id": "cupom_10percent", "discount": 10, "discountKind": "PERCENTAGE" }]

# 2. Validar cupom
curl http://localhost:3001/api/coupon/validate/PROMO2025
# Resultado: { "discount": 10, "discountKind": "PERCENTAGE" }

# 3. Criar cobrança com cupom
# Amount deve ser: preço original - desconto
# Se preço = R$ 100 e desconto = 10%:
# Amount = 100 - (100 * 10/100) = 90

curl -X POST http://localhost:3001/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 90.00,
    "registrationId": "reg_123",
    "registrationEmail": "user@example.com",
    "registrationName": "João Silva",
    "couponId": "cupom_10percent"
  }'

# 4. Resto é igual...
```

### Cenário 3: Debugar Webhook Falho

```bash
# 1. Listar logs de webhook
curl http://localhost:3001/api/webhook/logs | jq '.data[]' | head -1

# 2. Procurar por erros
curl http://localhost:3001/api/webhook/logs \
  | jq '.data | map(select(.response_status != "200"))'

# 3. Ver detalhes do erro
curl http://localhost:3001/api/webhook/logs \
  | jq '.data[0] | {billing_id, error_message, request_body}'

# 4. Verificar pagamento no banco
# → Supabase → payments → buscar por billing_id
```

---

## 🛠️ Testando com Postman/Insomnia

### Importar Collection

1. Abra Postman/Insomnia
2. Crie nova request
3. Configure:
   - **Method:** POST/GET (conforme endpoint)
   - **URL:** http://localhost:3001/api/...
   - **Headers:** Content-Type: application/json (para POST)
   - **Body:** JSON (conforme exemplos acima)
4. Clique "Send"

### Variáveis de Ambiente (Postman)

```json
{
  "backend_url": "http://localhost:3001"
}
```

Usar em requests: `{{backend_url}}/api/payment/create`

---

## 🚨 Tratamento de Erros

### Errros Comuns

**Erro: "Cannot POST /api/payment/create"**
- Verificar: Backend está rodando? `npm run dev:backend`
- Verificar: URL exata do endpoint

**Erro: "Invalid coupon"**
- Validar coupon ID com `GET /api/coupon/validate/:code`
- Verificar se cupom ainda tem uses disponíveis

**Erro: "Payment not found"**
- Webhook chegou, mas billing_id não existe em `payments`
- Verificar migração de banco: todas as colunas presentes?
- Verificar se resposta de criação de cobrança foi parseada corretamente

**Erro: "Connection refused"**
- Backend não está rodando
- Porta 3001 está bloqueada
- Firewall bloqueando localhost:3001

---

## 📈 Rate Limiting

Nenhum rate limiting configurado. Configure se necessário no `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requests por IP
});

app.use('/api/', limiter);
```

---

## 🔒 Headers de Segurança

Endpoints incluem:
- ✅ Validação de tipos
- ✅ Verificação de body obrigatórios
- ✅ Try/catch para erros

Faltando (pode adicionar):
- ⚠️ CORS customizado
- ⚠️ Rate limiting
- ⚠️ API key authentication
- ⚠️ HTTPS em produção

---

## 📱 Teste via cURL

```bash
# Test simples (sem desconto)
curl -X POST http://localhost:3001/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"amount":50,"registrationId":"test123","registrationEmail":"test@test.com","registrationName":"Test"}'

# Com jq para formatar (se tiver jq instalado)
curl http://localhost:3001/api/coupons/list | jq

# Salvar resposta em arquivo
curl http://localhost:3001/api/webhook/logs > webhook_logs.json
```

---

## 📚 Referências

- **AbacatePay API:** https://docs.abacatepay.com
- **Backend Code:** `server.js`
- **Documentação Webhooks:** `MONITORING_WEBHOOKS.md`
- **Monitoramento:** `npm run monitor:webhooks`

---

**Última atualização:** 23/02/2025
**Status:** ✅ Todos os endpoints operacionais
