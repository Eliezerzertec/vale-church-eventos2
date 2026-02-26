# 🧪 Guia de Teste: Verificar se Pagamento Confirma Agora

## ⚡ Quick Start (5 minutos)

```bash
# 1️⃣ Terminal 1: Inicie o Backend
npm run dev:backend
# Deve aparecer: ✅ Backend de pagamentos rodando em http://localhost:3001

# 2️⃣ Terminal 2: Inicie o Frontend
npm run dev
# Deve aparecer: ✅ Local: http://localhost:8081

# 3️⃣ Terminal 3: Monitore Webhooks
npm run monitor:webhooks
# Vai aguardar webhooks chegarem (deixe rodando)
```

---

## 🧑‍💻 Teste Manual (8 passos)

### Passo 1: Abra o App
```
URL: http://localhost:8081
```

### Passo 2: Crie um Evento de Teste (se não tiver)
```
Admin → Criar Evento
• Título: "Evento Teste Pagamento"
• Preço: R$ 10,00 (ou outro valor pequeno)
• Data: Qualquer data futura
• Status: Publicado

Salve e pegue o ID do URL
Exemplo: /eventos/550e8400-e29b-41d4-a716-446655440000
                 ↑ Copy este ID
```

### Passo 3: Vá para o Evento
```
URL: http://localhost:8081/eventos/550e8400-e29b-41d4-a716-446655440000
```

### Passo 4: Preencha o Formulário
```
Nome Completo: [seu nome]
Email: test@gmail.com
Telefone: (31) 99999-9999
CPF: 123.456.789-00 (qualquer número válido)

Clique: "Pagar com AbacatePay"
```

### Passo 5: Monitore o Console
```
Abra: DevTools (F12) → Console

Procure por:
✅ "📋 Buscando info de pagamento"
✅ "✅ Registration encontrado"
✅ "✅ Payment encontrado por registration_id"
```

### Passo 6: Complete o Pagamento no AbacatePay
```
Você será redirecionado para AbacatePay
Escolha PIX (mais rápido)
Complete o pagamento

IMPORTANTE: Use um valor de TESTE (R$ 1,00 se possível)
Ou use cartão de teste se abacatepay oferece
```

### Passo 7: Volte para o App (Auto-redirect)
```
Será redirecionado para:
/payment-confirmation/550e8400-e29b-41d4-a716-446655440000?registration_id=xxx&billing_id=PENDING

Procure por no console:
✅ "🔍 Status determinado: paid"
OU
⏳ "Status determinado: pending"
```

### Passo 8: Aguarde Confirmação (30 segundos)
```
Se status = "pending":
  • Página fará auto-refresh a cada 3-5-10 segundos
  • Procure no Terminal 3 por: ✅ Webhook recebido: billing.paid
  • Assim que webhook chegar, status muda para "paid"
  • ✅ Você verá: "Pagamento Confirmado!"

Se status = "paid" (imediato):
  • ✅ Pagamento Confirmado!
  • Ver comprovante e ações
```

---

## 📊 Verificação Técnica Pós-Teste

### Check 1: Backend respondeu?
```bash
# Terminal já deixado rodando
npm run monitor:webhooks

# Procure por:
✅ Webhook recebido: billing.paid
   billing_id: ABC123...
   status: 200
```

### Check 2: Banco de Dados atualizado?
**Supabase Dashboard → SQL Editor:**
```sql
-- Ver pagamento criado
SELECT registration_id, billing_id, status, created_at 
FROM payments 
ORDER BY created_at DESC 
LIMIT 1;

-- Esperado:
| registration_id | billing_id | status | created_at |
|-----------------|-----------|--------|-----------|
| abc123...       | ABC..      | paid   | 2026-02-23 14:30 |
```

### Check 3: Inscrição confirmada?
```sql
SELECT id, status, payment_processed, updated_at 
FROM event_registrations 
WHERE id = 'ABC123'  -- Copy registration_id de cima
LIMIT 1;

-- Esperado:
| id      | status    | payment_processed | updated_at |
|---------|-----------|------------------|-----------|
| ABC123  | confirmed | true             | 2026-02-23 14:30 |
```

---

## ✅ Sinais de Sucesso

### 🟢 Tudo FUNCIONANDO:
- ✅ Página carrega com: "🔍 Buscando info de pagamento"
- ✅ Console mostra: "✅ Payment encontrado por registration_id"
- ✅ URL tem: registration_id (sempre) + billing_id (pode ser PENDING)
- ✅ Webhook aparece em: npm run monitor:webhooks
- ✅ Página muda de status em ~3-10 segundos
- ✅ Banco atualiza: payment.status = "paid", registration.status = "confirmed"
- ✅ Página exibe: ✅ Pagamento Confirmado!

### 🔴 Sinais de Problema:

| Sintoma | Causa | Solução |
|--------|-------|--------|
| "Erro ao processar" na página | registration_id faltando na URL | Verificar URL: precisa ter ?registration_id=xxx |
| "Payment encontrado por registration_id" mas status é "pending" por 5+ min | Webhook não chegou | Ver "Check 1" acima |
| Webhook NÃO aparece em monitor:webhooks | AbacatePay não enviar webhook | Configurar webhook (ver CONFIG_WEBHOOK_ABACATEPAY.md) |
| Banco mostra payment.status ainda "pending" | Webhook processou com erro | Abrir: Supabase → Functions → abacatepay-webhook → Recent Invocations |
| Page 404 ou erro ao buscar registration | registration_id inválido | Tentar novamente com novo pagamento |

---

## 🎬 Demo Esperada

```
✅ Início:
   Tela de inscrição do evento

✅ Após completar dados:
   Redirect para AbacatePay (checkout)

✅ Após pagar (PIX):
   Redirect de volta para app

✅ Página de confirmação:
   Status "Pagamento Pendente..." por ~3-10 segundos
   Console: 🔄 Auto-refresh tentativa 1/30, 2/30, ...

✅ Webhook chega:
   Terminal 3 mostra: ✅ Webhook recebido: billing.paid
   
✅ Próximo auto-refresh:
   Status muda para "Pagamento Confirmado!"
   Exibe: ✅ Comprovante, botões (Download/Email), Info

✅ Banco:
   payment.status = "paid"
   registration.status = "confirmed"
```

---

## 🐛 Se Ainda Não Funcionar

### Cenário 1: "Payment não encontrado em nenhuma estratégia"
**Causa:** Não há registro em `payments` table
**Solução:**
```bash
# 1. Verificar se INSERT funcionou:
npm run dev:backend

# 2. Ver logs no console (procure por 201/200)

# 3. SQL: Verificar se payment foi criado
SELECT COUNT(*) FROM payments 
WHERE registration_id = 'SEU_REGISTRATION_ID';

# 4. Se COUNT = 0: problema é no INSERT, não no lookup
```

### Cenário 2: "Status remaining 'pending' forever"
**Causa:** Webhook não chega ou não processa
**Solução:**
```bash
# 1. Monitorar:
npm run monitor:webhooks

# 2. Fazer novo pagamento de teste

# 3. Ver se webhook aparece (pode levar 10-30 segundos)

# 4. Se NADA aparecer:
   → Webhook não está configurado no AbacatePay
   → Ver: CONFIG_WEBHOOK_ABACATEPAY.md

# 5. Se webhook aparece com ❌:
   → Erro no processamento
   → Abrir: Supabase Dashboard → Functions → abacatepay-webhook
   → Clicar em último invocation com ❌
   → Ler mensagem de erro
```

### Cenário 3: "RLS bloqueando updates"
**Causa:** Row-Level Security impedindo updates
**Solução:**
```bash
# 1. Ir: Supabase Dashboard
# 2. Authentication → Policies
# 3. Procurar "payments"
# 4. Se houver policy muito restritiva:
   → Delete ou ajustar
# 5. Testar novamente
```

---

## 📺 Comandos de Debug Rápido

```bash
# Ver webhook em tempo real
npm run monitor:webhooks

# Ver logs do backend
npm run dev:backend
# Procure por: 📤 POST /api/payment/create

# Ver erro do frontend
npm run dev
# Abra DevTools (F12) → Console → veja logs

# Testar webhook manualmente
curl -X POST http://localhost:3001/api/webhook/logs

# Ver payments criados
# SQL no Supabase:
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
```

---

## 🎯 Checklist Final

- [ ] Backend rodando: http://localhost:3001 (health check)
- [ ] Frontend rodando: http://localhost:8081
- [ ] Monitor de webhooks rodando: npm run monitor:webhooks
- [ ] Evento de teste criado e tem preço > 0
- [ ] Completou pagamento PIX no AbacatePay
- [ ] Webhook recebido em monitor
- [ ] Banco atualizado: payment.status = "paid"
- [ ] Página exibe: ✅ Pagamento Confirmado!
- [ ] Email de confirmação enviado (verifique Gmail)

---

## 🎉 Sucesso!

Se você viu TUDO acima ✅, então o BUG FOI CORRIGIDO! 

**Resultado esperado:** Pagamento confirma em ~3-10 segundos após webhook chegar

**Próximo passo:** Fazer teste em produção no Vercel se necessário

---

**Data:** 23 de Fevereiro de 2026
**Versão:** 1.0 - Com BUG FIX de PaymentConfirmationPage (lookup por registration_id)
