# 🧪 TESTE MANUAL - Pagamento sem Webhook Deploy

## 📋 Roteiro do Teste

### Pré-requisitos
```bash
# Terminal 1: Backend rodando
npm run dev:backend

# Terminal 2: Frontend rodando
npm run dev
```

Abra seu navegador: **http://localhost:8080**

---

## 🎯 Step-by-Step

### 1️⃣ Criar um Evento de Teste (via Admin)

```
Opção A: Usar Dashboard Supabase
- Vá para: https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme
- Clique em "SQL Editor"
- Execute:

INSERT INTO events (
  title, 
  description, 
  event_date, 
  location, 
  price,
  max_registrations, 
  is_active
)
VALUES (
  '🎉 Teste de Pagamento PIX',
  'Evento de teste para validar integração',
  NOW() + INTERVAL '7 days',
  'Vale Church Lavras',
  100.00,
  100,
  true
) RETURNING id;

- Copie o ID retornado
```

### 2️⃣ Ou Crie via Frontend

```
1. Acesse: http://localhost:8080/eventos
2. Se houver eventos, escolha um
3. Se não houver, precise criar via Supabase (Step 1️⃣)
```

### 3️⃣ Acessar Página de Inscrição

```
URL: http://localhost:8080/eventos/{EVENT_ID}

Exemplo:
http://localhost:8080/eventos/abc-123-def
```

### 4️⃣ Preencher Formulário

```
Nome: João da Graça
Email: joao@example.com
Telefone: (35) 99999-9999
CPF: 123.456.789-00
```

### 5️⃣ Clicar "Inscrever-se e Pagar"

```
✅ Sistema cria inscrição (status: pending)
✅ Sistema cria cobrança no AbacatePay
✅ RetortUrl recebe um link de checkout real
✅ Browser abre nova aba com: https://app.abacatepay.com/pay/bill_...
```

### 6️⃣ Voltar para a Primeira Aba

```
Você está automaticamente na página:
http://localhost:8080/payment-confirmation/{EVENT_ID}?registration_id=xxx&billing_id=bill_...

Status: ⏳ "Aguardando Confirmação"
Polling: 🔄 Verificando a cada 3 segundos
```

### 7️⃣ Simular Confirmação de Pagamento

**Opção A: Via Dashboard Supabase**

```sql
-- No SQL Editor fazer:
UPDATE payments 
SET status = 'paid', 
    transaction_id = 'pix_' || extract(epoch from now())::int::text,
    updated_at = now()
WHERE billing_id LIKE 'bill_%'
ORDER BY created_at DESC 
LIMIT 1;
```

**Opção B: Via Script Python/Node**

```javascript
const supabase = createClient(URL, KEY);
await supabase
  .from('payments')
  .update({ status: 'paid', transaction_id: `pix_${Date.now()}` })
  .order('created_at', { ascending: false })
  .limit(1);
```

### 8️⃣ Observar a Página Atualizar

```
Na próxima verificação de polling (até 3 segundos):
✅ Status muda para: "Pagamento Confirmado"
✅ Mostra comprovante com:
   - Nome do evento
   - Data do evento
   - CPF/Email participante
   - Valor pago
   - Data do pagamento
✅ Exibe mensagem: "Obrigado! Seu Pagamento Foi Confirmado"
✅ Mostra botões: Download Recibo, Enviar por Email
✅ Mostra próximas orientações
```

---

## 🔍 Como Verificar se está Funcionando

### ✅ Checklist de Sucesso

- [ ] Evento aparece na lista `/eventos`
- [ ] Formulário de inscrição valida dados
- [ ] Clique em "Inscrever-se e Pagar" não dá erro
- [ ] AbacatePay abre nova aba com checkout
- [ ] URL de confirmação tem `registration_id` e `billing_id`
- [ ] Página mostra "Aguardando Confirmação" com spinner
- [ ] Console mostra logs de polling (F12 → Console)
- [ ] Após atualizar pagamento → página muda para "Confirmado" ✅
- [ ] Comprovante mostra dados corretos
- [ ] Botões funcionam (Download, Enviar)

### 📊 O que Ver no Console (F12)

```javascript
// Quando página carrega:
"📋 Buscando info de pagamento: {registrationId: 'xxx', billingId: 'bill_...'}"

// Quando polling ativa:
"🔄 Iniciando polling para status de pagamento..."
"📊 Status atual: {status: 'pending', createdAt: '...'}"
"📊 Status atual: {status: 'pending', createdAt: '...'}"
// ... repete a cada 3 segundos

// Quando encontra "paid":
"🎉 ✅ PAGAMENTO CONFIRMADO!"
"🛑 Polling desativado"
```

---

## 🚨 Se Houver Erro

### Erro: "Registration ID não fornecido"
```
❌ URL não tem ?registration_id=xxx
✅ Solução: Usar o link correto que viene do formulário
```

### Erro: "Payment not found"
```
❌ Pagamento não foi criado
✅ Verificar console do backend
✅ Verificar dashboard Supabase → tabela payments
```

### Erro: "Unauthorized" ao atualizar pagamento
```
❌ RLS policy bloqueando
✅ Verifique em: Supabase → Authentication → Policies
✅ Execute migration RLS se necessário
```

### Polling não funciona
```
❌ Intervalo de 3s pode ser muito longo
✅ Abra DevTools (F12) e veja logs
✅ Se houver erro CORS, reinicie backend
```

---

## 🎬 Próximas Ações Após Teste Funcionar

### 1️⃣ Deploy do Webhook (Modo Production)
```bash
npx supabase functions deploy abacatepay-webhook
```

### 2️⃣ Testar com AbacatePay Real
```
- Usar dados reais (event_id, email, etc)
- Usar CPF válido (não o 123.456.789-00)
- Fazer pagamento real de teste
- Webhook será chamado AUTOMATICAMENTE
- Página atualizará em tempo real (sem polling)
```

### 3️⃣ Configurar Email de Confirmação
```
Editar: supabase/functions/abacatepay-webhook/index.ts
Linha: await sendConfirmationEmail(...)
```

### 4️⃣ Gerar PDF do Recibo
```
Adicionar: npm install @react-pdf/renderer
Criar: src/components/ReceiptPDF.tsx
```

---

## 📞 Dicas de Debug

### Ver Logs do Polling
```javascript
// Abrir DevTools → Console (F12)
// Procurar por: "📊 Status atual"
```

### Ver Dados do BD
```sql
-- Supabase SQL Editor
SELECT * FROM payments ORDER BY created_at DESC;
SELECT * FROM event_registrations ORDER BY created_at DESC;
```

### Forçar Atualizar Página
```
Ctrl + F5 (Windows) ou Cmd + Shift + R (Mac)
```

### Inspecionar Request/Response
```
DevTools → Network → Procurar por "supabase"
Ver headers e payload
```

---

## 🎉 Quando Tudo Estiver Funcionando

Você terá:
✅ Sistema de inscrição funcional
✅ Integração com AbacatePay funcionando
✅ Página de confirmação atualizando
✅ Comprovante exibido corretamente
✅ Pronto para ir para produção!

---

## 🔗 Referências

| Item | Link |
|------|------|
| Código Polling | `src/pages/PaymentConfirmationPage.tsx` |
| Script Teste | `test-payment-without-webhook.js` |
| Docs AbacatePay | `INTEGRACAO_ABACATEPAY_OFICIAL.md` |
| API de Pagamento | `src/integrations/abacatepay/client.ts` |

