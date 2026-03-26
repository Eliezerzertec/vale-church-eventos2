# 📊 Sistema de Monitoramento de Transações AbacatePay

## Visão Geral

Todo payment criado e transação com a API AbacatePay é registrado automaticamente em:**`api_transaction_logs`** para auditoria e debugging.

---

## 🔧 Endpoints de Monitoramento

### 1. **Últimas Transações**
```
GET /api/monitor/transactions?limit=50&status=all
```

**Parâmetros:**
- `limit`: Número de registros (default: 50, max: 1000)
- `status`: `'error'`, `'success'`, ou `'all'` (default: all)

**Exemplo:**
```bash
curl http://localhost:3001/api/monitor/transactions?limit=20&status=error
```

**Resposta:**
```json
{
  "error": null,
  "count": 20,
  "data": [
    {
      "id": "uuid",
      "transaction_id": "txn_1708967426000_xyz123",
      "api_type": "abacatepay",
      "endpoint": "/billing/create",
      "method": "POST",
      "request_body": { ... },
      "response_status": 400,
      "response_body": { ... },
      "error_message": "Invalid taxId",
      "duration_ms": 342,
      "user_email": "user@example.com",
      "registration_id": "uuid",
      "billing_id": "bill_xyz",
      "created_at": "2026-02-28T19:43:46.078Z"
    }
  ]
}
```

---

### 2. **Transações de um Usuário**
```
GET /api/monitor/user/:email
```

**Exemplo:**
```bash
curl http://localhost:3001/api/monitor/user/zertec.eliezer@hotmail.com
```

**Resposta:**
```json
{
  "error": null,
  "count": 5,
  "userEmail": "zertec.eliezer@hotmail.com",
  "data": [...]
}
```

---

### 3. **Transações de uma Cobrança (Billing)**
```
GET /api/monitor/billing/:billingId
```

**Exemplo:**
```bash
curl http://localhost:3001/api/monitor/billing/bill_S1GkTKyKZtc0aCKys1mBRQqB
```

**Útil para:** Ver O HISTÓRICO COMPLETO de uma cobrança (création, tentativas de consulta, erros, etc)

---

### 4. **Estatísticas Gerais**
```
GET /api/monitor/stats
```

**Resposta:**
```json
{
  "error": null,
  "data": {
    "total": 127,
    "success": 115,
    "errors": 12,
    "successRate": "90.55%",
    "averageDurationMs": 287,
    "topErrors": [
      ["Invalid taxId", 8],
      ["Insufficient permissions", 3],
      ["HTTP 404", 1]
    ],
    "endpointUsage": {
      "/billing/create": 102,
      "/billing/{id}": 25
    }
  }
}
```

---

### 5. **Transação Específica**
```
GET /api/monitor/transaction/:transactionId
```

**Exemplo:**
```bash
curl http://localhost:3001/api/monitor/transaction/txn_1708967426000_xyz123
```

---

## 🎯 Fluxo de Monitoramento

### Quando um aluno paga:

1. ✅ Frontend envia `/api/payment/create` com dados
2. ✅ Backend registra em `api_transaction_logs` com `transaction_id` único
3. ✅ Backend faz request à AbacatePay
4. ✅ Backend registra resposta (sucesso ou erro)
5. ✅ Frontend recebe `transactionId` na resposta

**Você pode consultar:** `GET /api/monitor/transaction/txn_xxxxx`

---

## 🐛 Debugging de Erros

### Cenário: "AbacatePay Error HTTP 400"

**Passo 1:** Buscar últimas transações com erro
```bash
curl http://localhost:3001/api/monitor/transactions?status=error
```

**Passo 2:** Encontrar a transação e verificar
```bash
curl http://localhost:3001/api/monitor/transaction/txn_xxxxx
```

**Passo 3:** Analisar:
- `request_body`: Qual era o payload enviado?
- `error_message`: Qual é o erro exato?
- `response_body`: Resposta completa da API
- `duration_ms`: Quanto tempo demorou?

---

## 💡 O que é registrado?

Cada transação captura:

```typescript
{
  id: UUID,                        // ID único do log
  transaction_id: string,          // txn_xxxxx (chave de correlação)
  api_type: 'abacatepay',         // Tipo de API
  endpoint: string,                // /billing/create, /billing/{id}, etc
  method: 'GET' | 'POST',         // Método HTTP
  request_body: object,            // Payload enviado
  response_status: number,         // 200, 400, 500, etc
  response_body: object,           // Resposta da API
  error_message: string | null,    // Erro (se houver)
  duration_ms: number,             // Tempo em milissegundos
  user_email: string,              // Email do aluno
  registration_id: UUID,           // ID da inscrição
  billing_id: string,              // ID da cobrança no AbacatePay
  created_at: timestamp            // Quando foi registrado
}
```

---

## 🔍 Exemplos Práticos

### Encontrar todos os erros de "Invalid taxId"
```sql
SELECT * FROM api_transaction_logs 
WHERE error_message LIKE '%Invalid taxId%'
ORDER BY created_at DESC;
```

### Encontrar CPFs inválidos enviados
```sql
SELECT 
  user_email,
  (request_body -> 'customer' -> 'taxId') as taxId,
  error_message
FROM api_transaction_logs
WHERE error_message LIKE '%Invalid taxId%'
ORDER BY created_at DESC;
```

### Taxa de sucesso por hora
```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hora,
  COUNT(*) as total,
  COUNT(CASE WHEN error_message IS NULL THEN 1 END) as sucesso,
  ROUND(100.0 * COUNT(CASE WHEN error_message IS NULL THEN 1 END) / COUNT(*), 2) as taxa_sucesso
FROM api_transaction_logs
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hora DESC;
```

---

## 📝 Console Logging

Além do banco de dados, o backend imprime logs detalhados:

```
🔍 ========== /api/payment/create REQUEST RECEBIDO ==========
⏰ Timestamp: 2026-02-28T19:43:46.078Z
📤 Método: POST
🔗 Endpoint: /billing/create
👤 Usuario: user@example.com
💰 Valor: 12000 centavos

📤 Enviando para: https://api.abacatepay.com/v1/billing/create
📋 Body completo: {...}

📥 Resposta AbacatePay
   Status: 200 OK
   ⏱️ Duração: 342ms
   Body: {...}

✅ Sucesso!
   Billing ID: bill_S1GkTKyKZtc0aCKys1mBRQqB
   URL: https://app.abacatepay.com/pay/bill_...
🔗 Transaction ID: txn_1708967426000_xyz123
========================================
```

---

## 🚀 Próximos Passos

1. **Executar a migration SQL** para criar a tabela
2. **Testar um payment** e verificar se está sendo registrado
3. **Usar os endpoints** para debugar erros
4. **Criar um dashboard** (opcional) em admin para visualizar logs em tempo real
