# ✅ Sistema de Monitoramento Implementado

## O que foi implementado?

### 1. ✅ **Função de Logging Automático**
   - Toda transação de API AbacatePay é registrada em `api_transaction_logs`
   - Inclui: request, response, status, duração, erros, email do usuário, etc

### 2. ✅ **Logging Detalhado no Console**
   - Cada requisição mostra:
     - Timestamp
     - Email do usuário
     - Valor da cobrança
     - Request body
     - Response status
     - Tempo de resposta
     - Billing ID
     - **Transaction ID único** para rastreamento

### 3. ✅ **5 Endpoints de Monitoramento Novos**
   - `GET /api/monitor/transactions` - Últimas transações (com filtro de erro/sucesso)
   - `GET /api/monitor/user/:email` - Transações de um usuário
   - `GET /api/monitor/billing/:billingId` - Histórico de uma cobrança específica
   - `GET /api/monitor/stats` - Estatísticas gerais (taxa de sucesso, erros comuns, etc)
   - `GET /api/monitor/transaction/:id` - Detalhes de uma transação específica

---

## 🚀 Como Usar?

### Passo 1: Executar a Migration SQL
Copie e execute em Supabase SQL Editor:
```sql
-- Criar tabela api_transaction_logs
-- (veja MIGRATION_API_LOGS.sql)
```

### Passo 2: Testar um Payment
1. Acesse a página de evento
2. Preencha formulário e clique em "Pagar"
3. Você verá o `transactionId` na resposta

### Passo 3: Visualizar Logs

#### **Opção A: Via Console do Backend**
```
node server.js
```
Você verá algo como:
```
📤 Método: POST
👤 Usuario: zertec.eliezer@hotmail.com
💰 Valor: 12000 centavos
📥 Response Status: 200
✅ Sucesso!
🔗 Transaction ID: txn_1708967426000_xyz123
```

#### **Opção B: Via API REST**

**Últimas 20 erros:**
```bash
curl http://localhost:3001/api/monitor/transactions?limit=20&status=error
```

**Transações de um usuário:**
```bash
curl http://localhost:3001/api/monitor/user/zertec.eliezer@hotmail.com
```

**Histórico de uma cobrança:**
```bash
curl http://localhost:3001/api/monitor/billing/bill_S1GkTKyKZtc0aCKys1mBRQqB
```

**Estatísticas gerais:**
```bash
curl http://localhost:3001/api/monitor/stats
```

---

## 📊 O que é capturado em cada log?

```json
{
  "transaction_id": "txn_1708967426000_xyz123",
  "api_type": "abacatepay",
  "endpoint": "/billing/create",
  "method": "POST",
  "request_body": { /* payload enviado */ },
  "response_status": 200,
  "response_body": { /* resposta da API */ },
  "error_message": null,
  "duration_ms": 342,
  "user_email": "user@example.com",
  "registration_id": "uuid",
  "billing_id": "bill_xxxxx",
  "created_at": "2026-02-28T19:43:46.078Z"
}
```

---

## 🎯 Casos de Uso

### ❌ Erro: "Invalid taxId"
1. Busque: `GET /api/monitor/transactions?status=error`
2. Procure pelo erro message "Invalid taxId"
3. Verifique o `request_body.customer.taxId`
4. **Solução**: CPF inválido ou com máscara (já corrigido no código)

### ❌ Erro: "HTTP 400"
1. Busque: `GET /api/monitor/transaction/:id`
2. Veja a resposta completa em `response_body`
3. Essa é a mensagem exata da AbacatePay

### ❌ Link de pagamento não apareceu
1. Busque transação do usuário: `GET /api/monitor/user/:email`
2. Verifique se `response_status` é 200
3. Verifique se há URL em `response_body.url` ou `response_body.paymentUrl`

### 📈 Taxa de sucesso/erro
1. Busque: `GET /api/monitor/stats`
2. Veja `successRate`, `total`, `success`, `errors`

---

## 🔐 Segurança

- **Todos os logs são armazenados no Supabase** (criptografado)
- **Inclui dados sensíveis** (email, CPF parcial)
- **Restrinja acesso** aos endpoints de monitoramento em produção
- **Implemente autenticação** se expor para admin dashboard

---

## 📝 Próximos Passos

1. ✅ Implementado: Logging detalhado
2. ✅ Implementado: Endpoints de monitoramento
3. ⏳ TODO: Dashboard admin para visualizar logs
4. ⏳ TODO: Alertas automáticos para erros críticos
5. ⏳ TODO: Retry automático para falhas de conexão

---

## 📞 Suporte

Se encontrar um erro:
1. Busque a transação pelo `transaction_id` ou `user_email`
2. Analise `request_body` e `response_body`
3. Compare com documentação da AbacatePay: https://docs.abacatepay.com
