# 📊 Monitoramento de Webhooks AbacatePay

## Visão Geral

Sistema completo para monitorar, registrar e debugar webhooks recebidos do AbacatePay em tempo real.

## Architecture

```
AbacatePay Webhook
        ↓
Supabase Edge Function (abacatepay-webhook)
        ↓
✅ Processa pagamento
✅ Atualiza banco de dados
✅ Logger registra evento em webhook_logs
        ↓
Backend Express (GET /api/webhook/logs)
        ↓
Monitor CLI (monitor-webhooks.js)
        ↓
Usuário vê eventos em tempo real
```

## Setup Inicial

### 1. Criar Tabela webhook_logs

Abra o Supabase SQL Editor e execute:

```bash
-- Arquivo: MIGRAÇÃO_6_WEBHOOK_LOGS.sql
-- Copie o conteúdo e execute no Supabase
```

**Instruções:**
1. Vá para: https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql/new
2. Cole o conteúdo do arquivo MIGRAÇÃO_6_WEBHOOK_LOGS.sql
3. Pressione Ctrl+Enter para executar
4. Confirme a mensagem "Query executed successfully"

### 2. Iniciar Backend

```bash
npm run dev:backend
```

Você verá:
```
✅ Server running on http://localhost:3001
📡 Webhook receiver: https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
```

### 3. Monitorar Webhooks

Em um novo terminal:

```bash
npm run monitor:webhooks
```

## Uso

### Monitor CLI

```bash
npm run monitor:webhooks
```

**Output esperado:**
```
🔍 Monitor de Webhooks do AbacatePay
⚙️  Backend: http://localhost:3001
⏱️  Polling a cada 3s

Aguardando webhooks...

2 novo(s) evento(s) detectado(s):

1. ✅ [23/02/2025 14:35:42]
   Evento: billing.paid
   ID Cobrança: bill_abc123def456
   Status HTTP: 200
   Payload: {"event":"billing.paid","data":...

2. ❌ [23/02/2025 14:35:10]
   Evento: billing.paid
   ID Cobrança: bill_xyz789
   Status HTTP: 400
   ⚠️  Erro: Payment not found in database
```

**Símbolos:**
- ✅ Webhook processado com sucesso (HTTP 200)
- ❌ Erro ao processar (HTTP 4xx/5xx)
- ⏳ Aguardando webhooks
- . (ponto) Polling em andamento

### API REST

Você também pode consultar os logs via API:

```bash
# Buscar últimos 50 webhooks
curl http://localhost:3001/api/webhook/logs

# Resposta:
{
  "error": null,
  "data": [
    {
      "id": "uuid-1",
      "event": "billing.paid",
      "billing_id": "bill_abc123",
      "status": "paid",
      "request_body": {...},
      "response_status": "200",
      "error_message": null,
      "created_at": "2025-02-23T14:35:42Z"
    },
    ...
  ],
  "total": 2,
  "timestamp": "2025-02-23T14:36:00Z"
}
```

## Testando o Fluxo Completo

### Teste 1: Pagamento com Sucesso (PIX)

1. **Iniciar sistema:**
   ```bash
   # Terminal 1
   npm run dev:backend
   
   # Terminal 2
   npm run dev
   
   # Terminal 3
   npm run monitor:webhooks
   ```

2. **Fazer pagamento:**
   - Abra http://192.168.2.104:8081
   - Vá para um evento
   - Clique em "Registrar"
   - Preencha os dados
   - (Opcional) Aplique um cupom para testar desconto
   - Clique em "Pagar com AbacatePay"
   - Escaneie o código QR (PIX) ou teste com número fictício

3. **Monitorar:**
   - No Terminal 3, você verá:
   ```
   📥 1 novo(s) evento(s) detectado(s):
   
   1. ✅ [HH:MM:SS]
      Evento: billing.paid
      ID Cobrança: bill_xxxx
      Status HTTP: 200
   ```

4. **Verificar banco de dados:**
   - Supabase → payments → Verificar que `status = "paid"` e `payment_url` foi preenchido
   - event_registrations → Verificar que `confirmed = true`

### Teste 2: Pagamento com Erro

Se o webhook falhar (ex: billing_id não encontrado):

```
1. ❌ [HH:MM:SS]
   Evento: billing.paid
   ID Cobrança: bill_invalid
   Status HTTP: 400
   ⚠️  Erro: Payment not found in database
```

**Ações de Debug:**
1. Verificar se `billing_id` foi salvo corretamente na tabela `payments`
2. Verificar se a resposta de criação de cobrança retornou o ID correto
3. Verificar logs da função Edge no Supabase (Functions → abacatepay-webhook → Logs)

## Troubleshooting

### "Cannot find table webhook_logs"

**Solução:** Execute a migração MIGRAÇÃO_6_WEBHOOK_LOGS.sql no Supabase

### "Erro ao conectar: ERR_CONNECTION_REFUSED"

**Solução:** Certifique-se que o backend está rodando:
```bash
npm run dev:backend
```

### Webhooks não aparecem

**Verificar:**
1. AbacatePay webhook URL configurado: https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
2. Secret webhook: qwe123123
3. Função Edge tem permissão para INSERT em webhook_logs
4. Supabase RLS policies permitem INSERT

### Webhook recebido mas erro no processamento

Verifique o `error_message` no log:
- "Payment not found" → billing_id não está na tabela
- "RLS policy violation" → Permissão insuficiente
- "Column does not exist" → Falta migração de tabela

Solução: Verificar que todas as migrações foram executadas no Supabase (1-5)

## Estrutura da Tabela webhook_logs

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único do log |
| event | TEXT | Tipo do evento (ex: "billing.paid") |
| billing_id | TEXT | ID da cobrança do AbacatePay |
| status | TEXT | Status do pagamento (paid, pending, failed) |
| request_body | JSONB | Payload completo do webhook |
| response_status | TEXT | HTTP status da resposta (200, 400, etc) |
| error_message | TEXT | Mensagem de erro se houver |
| created_at | TIMESTAMPTZ | Data/hora do recebimento |

## Índices de Performance

```sql
-- Buscar por billing_id (rápido)
SELECT * FROM webhook_logs WHERE billing_id = 'bill_xxx';

-- Buscar por período (rápido)
SELECT * FROM webhook_logs WHERE created_at > '2025-02-23'::date;

-- Últimos eventos (mais rápido)
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 50;
```

## Próximos Passos

1. ✅ **Monitoramento em tempo real** - Usar `npm run monitor:webhooks`
2. 🔄 **Dashboard Web** (Opcional) - Criar página admin com gráficos de webhooks
3. 📧 **Notificações** (Opcional) - Enviar email/SMS quando webhook falhar
4. 🔔 **Alertas** (Opcional) - Configurar notificações para webhooks críticos

## Referências

- **AbacatePay API:** https://docs.abacatepay.com
- **Webhook payload:** Salvo em `request_body` como JSONB
- **Status codes:** GET /api/webhook/logs
- **Backend API:** http://localhost:3001/api/*

---

**Criado em:** 23/02/2025
**Sistema:** Vale Church Manager
**Última atualização:** Sistema de monitoramento implementado
