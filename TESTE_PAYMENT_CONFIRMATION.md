# ✅ Testando a Página de Confirmação de Pagamento

## ⚡ Setup Rápido

### Terminal 1: Backend
```bash
npm run dev:backend
```

### Terminal 2: App
```bash
npm run dev
```

### Terminal 3: Monitor (opcional)
```bash
npm run monitor:webhooks
```

---

## 🧪 Teste Passo a Passo

### 1️⃣ Acessar App
```
http://192.168.2.104:8081
```

### 2️⃣ Clique em um Evento
- Qualquer evento com preço

### 3️⃣ Preencha o Formulário
```
Nome: João Silva
Email: joao@example.com
Telefone: 11987654321
CPF: 12345678901
Cupom: (deixe em branco ou use um válido)
```

### 4️⃣ Clique "Pagar com AbacatePay"
- Será redirecionado para o checkout do AbacatePay

### 5️⃣ Teste de Pagamento
**Opção A: Teste com PIX**
- Clique em "PIX"
- Escaneie o código QR (com app de teste)
- Simule confirmação

**Opção B: Teste com Cartão**
- Clique em "CARD"
- Use número fictício: `4111111111111111`
- Data futura: `12/25`
- CVV: `123`

**Opção C: Simular Sem Pagar**
- Feche o pop-up
- A página ficará em "Pagamento Pendente"

### 6️⃣ Ver Página de Confirmação
Você será redirecionado para:
```
/payment-confirmation/1?registration_id=...&billing_id=...
```

---

## 📊 O Que Você Verá

### Cenário A: Pagamento Confirmado (✅)
```
✅ Pagamento Confirmado!
Sua inscrição foi processada com sucesso

[Comprovante de Pagamento]
- João Silva
- joao@example.com
- R$ 99.90
- PIX
- Data: 23/02/2025

[Botões]
📥 Download Recibo
📧 Enviar por Email

[Info]
✓ Email enviado em: joao@example.com
✓ Inscrição garantida
✓ Recibo disponível

[Voltar para Eventos]
```

### Cenário B: Pagamento Pendente (⏳)
```
⏳ Pagamento Pendente
Estamos aguardando a confirmação do pagamento

Pode levar alguns minutos. A página será atualizada automaticamente.
[Spinner animado]
Atualizando...

[Botão] Atualizar Agora
```

### Cenário C: Pagamento Falhou (❌)
```
❌ Pagamento Falhou
Houve um problema ao processar seu pagamento

→ Verifique sua conexão de internet
→ Verifique se tem saldo na conta
→ Tente novamente ou use outro meio de pagamento

[Tentar Novamente]
```

---

## 🔍 Verificar no Banco

### Supabase → event_registrations
```sql
SELECT * FROM event_registrations 
WHERE full_name = 'João Silva' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Você verá:**
- ✅ status = "confirmed" (se pagamento ok)
- ⏳ status = "pending" (se pagamento não confirmado)

### Supabase → payments
```sql
SELECT * FROM payments 
WHERE registration_id = '...' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Você verá:**
- billing_id (ID do AbacatePay)
- status: "paid" ou "pending"
- payment_method: "PIX" ou "CARD"
- receipt_url: Link para recibo
- coupon_code: Se usou cupom
- discount_amount: Valor economizado

---

## 📧 Testar Email

### Ver Email Enviado
Na página de confirmação:
1. Clique em "Enviar por Email"
2. Seu cliente de email abrirá
3. Cole o endereço: joao@example.com

### Email que será Enviado (futuro)
```
Assunto: Sua inscrição foi confirmada! - [Nome do Evento]

Olá João,

Sua inscrição foi confirmada com sucesso!

Detalhes:
- Evento: [Nome do Evento]
- Data: 15/03/2025
- Seu ID: 550e8400
- Recibo: [link para download]

Você pode comparecer com este número de inscrição.

Abraços,
Vale Church Manager
```

---

## 🎯 Checklist de Teste

- [ ] Página carrega após pagamento
- [ ] Mostra dados corretos (nome, email, valor)
- [ ] Mostra comprovante de pagamento
- [ ] Botão "Download Recibo" funciona (abre link)
- [ ] Botão "Enviar por Email" abre cliente
- [ ] Dados no Supabase estão corretos
- [ ] Status "confirmed" aparece em event_registrations
- [ ] Webhook foi registrado em webhook_logs

---

## 🐛 Se Não Funcionar

### Página branca / erro de carregamento
1. Verificar console (F12)
2. Ver se registration_id está na URL
3. Verificar se evento existe no Supabase

### Sempre mostra "Pagamento Pendente"
1. Verificar webhook: `npm run monitor:webhooks`
2. Verificar if billing_id foi salvo correto
3. Executar migração webhook_logs se não fez

### Dados não aparecem
1. Verificar se registration_id é válido
2. Verificar se pagamento foi criado no banco
3. Ver logs do backend: `npm run dev:backend`

---

## ✅ Tudo Funcionando?

Se chegou até aqui, significa que:
- ✅ App rodando
- ✅ Backend rodando
- ✅ Página de confirmação implementada
- ✅ Integração com AbacatePay funciona
- ✅ Dados salvos no Supabase

**Próximo:** Testar pagamento real ou fazer ajustes finos!

---

**Última atualização:** 23/02/2025
