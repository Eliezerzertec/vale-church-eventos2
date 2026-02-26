# ⚡ Ativar Monitoramento de Webhooks - Guia Rápido

## Passo 1️⃣: Executar Migração no Supabase (1 min)

1. Vá para: https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql/new
2. **Copie** todo o conteúdo do arquivo: `MIGRAÇÃO_6_WEBHOOK_LOGS.sql`
3. **Cole** no Supabase SQL Editor
4. Pressione **Ctrl+Enter** para executar
5. Veja a mensagem: ✅ "Query executed successfully"

## Passo 2️⃣: Iniciar Backend (1 terminal)

```bash
npm run dev:backend
```

Saída esperada:
```
✅ Server running on http://localhost:3001
📡 Endpoints disponíveis:
   POST /api/payment/create
   GET  /api/coupons/list
   GET  /api/coupon/validate/:code
   GET  /api/payment/:billingId
   GET  /api/webhook/logs      - Monitor webhooks
```

## Passo 3️⃣: Monitorar Webhooks (novo terminal)

```bash
npm run monitor:webhooks
```

Saída como:
```
🔍 Monitor de Webhooks do AbacatePay
⚙️  Backend: http://localhost:3001
⏱️  Polling a cada 3s

Aguardando webhooks...
```

## Passo 4️⃣: Testar (em paralelo)

**Terminal 3:** Iniciar app:
```bash
npm run dev
```

**Browser:** 
- Vá para http://192.168.2.104:8081
- Clique em um evento → "Registrar"
- Complete a compra → "Pagar com AbacatePay"
- Teste com PIX ou cartão fictício

## Passo 5️⃣: Ver Webhooks em Tempo Real

Quando o pagamento é confirmado, no **Terminal 2** (monitor) você verá:

```
📥 1 novo(s) evento(s) detectado(s):

1. ✅ [23/02/2025 14:35:42]
   Evento: billing.paid
   ID Cobrança: bill_abc123def456
   Status HTTP: 200
```

---

## 🔗 Ver Logs via API

Também pode consultar via curl:

```bash
curl http://localhost:3001/api/webhook/logs
```

Retorna todos os webhooks recebidos.

---

## ✅ Checklist

- [ ] Migração executada no Supabase
- [ ] Backend rodando (`npm run dev:backend`)
- [ ] Monitor rodando (`npm run monitor:webhooks`)
- [ ] App rodando (`npm run dev`)
- [ ] Testou pagamento
- [ ] Viu webhook aparecer no monitor

---

**Tempo total:** ~2-3 minutos

Se houver erro, consult: `MONITORING_WEBHOOKS.md` (seção Troubleshooting)
