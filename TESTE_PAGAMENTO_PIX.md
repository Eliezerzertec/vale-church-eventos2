# 🧪 Guia de Teste - Pagamento PIX AbacatePay

**Data:** 20 de fevereiro de 2026  
**Projeto:** Vale Church Manager  
**Sistema:** Integração AbacatePay para Pagamento PIX/CARD

---

## 🎯 Objetivo

Testar o fluxo completo de pagamento PIX através do AbacatePay:
1. Inscrição em evento pago
2. Geração de cobrança
3. Redirecionamento para AbacatePay
4. Simulação de pagamento PIX
5. Webhook de confirmação

---

## 📋 Checklist Pré-Teste

- [x] API Key configurada: `VITE_ABACATEPAY_KEY=abc_dev_wsc2xLB4mS4cjj2LX3DUryzY`
- [x] Supabase conectado e tabela `payments` criada
- [x] Webhook endpoint configurado
- [x] Cliente AbacatePay implementado
- [x] EventDetailPage integrado
- [x] AdminPayments para visualização

---

## 🚀 Teste Passo-a-Passo

### Passo 1: Criar Evento de Teste (Admin)

```
1. Acessar Admin → Eventos
2. Criar novo evento:
   - Nome: "Teste PIX - Vale Church"
   - Data: Hoje + 1 dia
   - Preço: R$ 50,00 (is_free: false)
   - Descrição: "Evento de teste para pagamento PIX"
   - Status: Ativo (is_active: true)
```

### Passo 2: Inscrever-se no Evento Pago

```
1. Acessar página inicial (Index.tsx)
2. Clicar em "Ver Eventos"
3. Clicar no evento de teste
4. Preencher formulário:
   Nome: "João da Graça"
   Email: seu-email@example.com
   CPF: 123.456.789-00 (simulado)
5. Clicar "Inscrever-se"
```

**Esperado:** Redirecionamento para AbacatePay com link de pagamento

### Passo 3: Simulação de Pagamento PIX

#### No Dashboard AbacatePay (Modo Dev):
```
1. Acessar: https://abacatepay.com
2. Modo Dev ativado (VITE_ABACATEPAY_DEV=true)
3. Cobrança recém-criada na lista
4. Clicar em "Testar PIX" ou "Simular Pagamento"
5. Selecionar: PIX (não CARD para este teste)
6. Confirmar pagamento simulado
```

**Esperado:** Status muda de "PENDING" para "PAID"

### Passo 4: Verificar Webhook

```
1. Supabase envia webhook POST para:
   https://seu-supabase.supabase.co/functions/v1/abacatepay-webhook

2. Payload esperado:
   {
     "event": "billing.paid",
     "data": {
       "id": "billing_xxx",
       "status": "PAID",
       "amount": 5000,
       "customer": {...}
     }
   }

3. Função processa:
   - Atualiza payments.status → "paid"
   - Atualiza event_registrations.status → "confirmed"
   - payment_processed → true
```

### Passo 5: Verificar Admin Dashboard

```
1. Acessar Admin → Pagamentos
2. Deve aparecer na lista:
   - Status: "Pago" (verde)
   - Valor: R$ 50,00
   - Participante: João da Graça
   - Email: seu-email@example.com
3. Clicar "Sincronizar" para atualizar status
```

---

## 🔍 Validações Importantes

### ✅ Validações Técnicas

1. **Client AbacatePay**
   ```typescript
   - API Key válida
   - Request headers corretos
   - Response parsing correto
   - Tratamento de erros implementado
   ```

2. **Webhook Processing**
   ```typescript
   - Validação de payload
   - Mapeamento de status correto
   - Atualização de banco de dados
   - Transações atômicas
   ```

3. **Admin Dashboard**
   ```tsx
   - Listagem de pagamentos
   - Filtro por status
   - Botão sincronizar funcional
   - Cópiar link de pagamento
   ```

### ✅ Validações de Negócio

1. **Inscrição Pendente**
   - [ ] Inscrição criada com status "pending"
   - [ ] Cobrança criada no AbacatePay
   - [ ] Link de pagamento gerado

2. **Pagamento Confirmado**
   - [ ] Webhook recebido
   - [ ] Status atualizado para "paid"
   - [ ] Inscrição confirmada

3. **Falha no Pagamento**
   - [ ] Inscrição cancelada se timeout
   - [ ] Mensagem de erro exibida
   - [ ] Reutilização permitida

---

## 📊 Dados de Teste

### Evento de Teste
```json
{
  "title": "Teste PIX - Vale Church",
  "price": "50.00",
  "is_free": false,
  "event_date": "2026-02-21T19:00:00Z",
  "location": "Vale Church Lavras",
  "description": "Evento para testar integração PIX"
}
```

### Inscrição de Teste
```json
{
  "full_name": "João da Graça",
  "email": "joao@example.com",
  "phone": "(35) 99999-9999",
  "cpf": "123.456.789-00"
}
```

### Cobrança Esperada
```json
{
  "amount": 5000,
  "currency": "BRL",
  "description": "Inscrição - Teste PIX - Vale Church",
  "methods": ["PIX", "CARD"],
  "customer": {
    "id": "joao@example.com",
    "metadata": {
      "email": "joao@example.com",
      "name": "João da Graça",
      "registration_id": "uuid-xxx",
      "event_id": "uuid-xxx"
    }
  }
}
```

---

## 🐛 Troubleshooting

### Problema: API Key inválida
```
Erro: "The specified token is not valid"

Solução:
1. Verificar VITE_ABACATEPAY_KEY no .env
2. Confirmar com AbacatePay dashboard
3. Gerar nova chave se necessário
```

### Problema: Webhook não recebido
```
Erro: Pagamento não confirma automaticamente

Solução:
1. Verificar URL do webhook nas configurações AbacatePay
2. Confirmar domínio Supabase correto
3. Verificar logs do Supabase Functions
4. Testar manualmente via Supabase Dashboard
```

### Problema: Status não atualiza
```
Erro: Inscrição cont inua em "pending"

Solução:
1. Clicar botão "Sincronizar" no admin
2. Verificar se webhook foi processado
3. Checar logs do AbacatePay
4. Recarregar página para limpar cache
```

### Problema: Link de pagamento vazio
```
Erro: URL de pagamento não gerada

Solução:
1. Verificar resposta do AbacatePay
2. Confirmar status do billing_response
3. Checar console browser (F12)
4. Verificar network request to AbacatePay API
```

---

## 📱 Teste em Dispositivos

### Desktop
```
✓ Chrome DevTools F12
✓ Network tab para ver requisições
✓ Console tab para erros JS
✓ Application tab para local storage
```

### Mobile (iOS/Android)
```
✓ Testar via ngrok tunnel
✓ QR Code PIX no celular
✓ Confirmar redirecionamento
✓ Testar com app de banco simulado
```

---

## 📊 Métricas de Sucesso

| Métrica | Esperado | Status |
|---------|----------|--------|
| Inscrição criada | ✅ | [ ] |
| Cobrança gerada | ✅ | [ ] |
| Link AbacatePay funcional | ✅ | [ ] |
| Redirecionamento correto | ✅ | [ ] |
| PIX QR Code exibido | ✅ | [ ] |
| Webhook recebido | ✅ | [ ] |
| Status atualizado | ✅ | [ ] |
| Inscrição confirmada | ✅ | [ ] |
| Admin Dashboard atualizado | ✅ | [ ] |
| Email confirmação (TODO) | ⏳ | [ ] |

---

## 🎬 Cenários de Teste

### Cenário 1: Sucesso - PIX Confirmado
```
1. Inscrição OK
2. Cobrança criada
3. PIX pago
4. Webhook recebido
5. Inscrição confirmada ✅
```

### Cenário 2: Falha - Recusa de Pagamento
```
1. Inscrição OK
2. Cobrança criada
3. Pagamento recusado
4. Webhook recebido (FAILED)
5. Inscrição cancelada ✅
```

### Cenário 3: Timeout - Não paga em tempo
```
1. Inscrição OK
2. Cobrança criada
3. Pix expira (15 min default)
4. Webhook recebido (EXPIRED)
5. Inscrição cancelada ✅
```

### Cenário 4: Admin - Criar Cobrança Manual
```
1. Admin → Pagamentos
2. Inscrição não paga na lista
3. Clicar "Gerar Cobrança"
4. Link criado
5. Compartilhar com participante ✅
```

---

## 📝 Logs Esperados

### Browser Console
```
✓ Logo redirecionando para: https://pay.abacatepay.com/...
✓ Billing ID: billing_abc123
✓ Payment URL: https://pay.abacatepay.com/...
```

### Supabase Logs (Webhook)
```
✓ Webhook recebido: billing.paid
✓ Pagamento: 5000 centavos
✓ Inscrição atualizada: uuid-xxx
✓ Status: confirmed
```

### Browser Network Tab
```
POST /api/abacatepay/billing/create → 200 OK
  Response: { data: {...}, error: null }

POST /functions/v1/abacatepay-webhook → 200 OK
  Response: { ok: true, message: "Webhook processado" }
```

---

## ✅ Checklist Final de Teste

- [ ] Evento pago criado com sucesso
- [ ] Inscrição no evento realizada
- [ ] Redirecionado para AbacatePay
- [ ] PIX QR Code exibido
- [ ] Pagamento simulado no AbacatePay
- [ ] Webhook recebido no Supabase
- [ ] Status atualizado no banco
- [ ] Inscrição marcada como confirmada
- [ ] Admin Dashboard exibe pagamento
- [ ] Botão sincronizar funciona
- [ ] Sem erros de compilação
- [ ] Sem erros no console

---

## 🎯 Próximas Etapas Após Sucesso

1. **Implementar envio de email** após confirmação
2. **Testar reembolso** (refund via admin)
3. **Implementar retry** em falhas transientes
4. **Adicionar testes automatizados**
5. **Preparar para produção oficial**

---

**Status Teste:** 🟡 Aguardando Execução  
**Última Atualização:** 20/02/2026  
**Mantido por:** Copilot
