# ⚙️ Guia: Configurar Webhook no AbacatePay

## ⚠️ Problema Comum
Pagamento foi feito, mas a página fica em "Pagamento Pendente" porque o AbacatePay **não sabe para onde enviar o aviso** de que o pagamento foi confirmado.

---

## ✅ Solução: Configurar Webhook

### Passo 1: Entrar no Dashboard do AbacatePay
```
URL: https://abacatepay.com ou suDashboard.com
Login: Suas credenciais
```

### Passo 2: Ir para Webhooks
```
Dashboard → ⚙️ Configurações
             → 📡 Webhooks
             → (ou) Integrações → Webhooks
```

### Passo 3: Adicionar Novo Webhook

**Clique em:**
- [ ] "Adicionar Webhook" ou "Add Webhook" ou "+" verde

**Preencha com:**

| Campo | Valor |
|-------|-------|
| **URL do Webhook** | `https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook` |
| **Chave Secreta / Secret Key** | `qwe123123` |
| **Eventos** | `billing.paid` (OU selecionar apenas pagamentos confirmados) |
| **Ativo** | ✅ Ligado / Enabled |

### Passo 4: Salvar

```
Clique em: "Salvar" ou "Save" ou "Confirmar"
```

---

## 🔍 Verificar se Está Correto

Após salvar, o AbacatePay deve mostrar:

```
✅ Webhook adicionado com sucesso
   • URL: https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
   • Status: Ativo
   • Última sincronização: [data/hora]
            OU
   • Detalhe do último disparo: ✅ Status 200 (sucesso)
```

---

## 🧪 Testar Webhook

### Opção A: Dentro do AbacatePay (Recomendado)
```
Ir para: Webhooks → Seu webhook recém-criado
Opção: "Enviar Teste" ou "Send Test"
```

**Esperado:**
```
✅ Teste enviado com sucesso
   Resposta do servidor: {"ok": true, "message": "Webhook processado: billing.paid"}
```

### Opção B: Monitorar em Tempo Real
```bash
npm run monitor:webhooks
```

**Depois faça um pagamento de teste e procure por:**
```
✅ Webhook recebido: billing.paid
   billing_id: ABC123...
   status: 200 (sucesso)
```

---

## ❌ Se o Teste Falhar

| Erro | Causa | Solução |
|------|-------|--------|
| `401 Unauthorized` | Secret incorreto | Verificar se digitou exatamente: `qwe123123` |
| `404 Not Found` | URL errada | Usar: `https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook` |
| `500 Internal Server Error` | Erro no servidor | Verificar logs em: Supabase → Functions → abacatepay-webhook |
| `Connection Timeout` | URL não acessível | Verificar se URL começa com `https://` (não `http://`) |
| "Sem resposta" por 5+ min | Webhook pode estar inativo | Reabilitar: Settings → Webhooks → Toggle ON |

---

## 📋 Checklist Final

- [ ] URL completa sem erros: `https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook`
- [ ] Secret exatamente: `qwe123123`
- [ ] Evento selecionado: `billing.paid`
- [ ] Status: ✅ **Ativo/Habilitado**
- [ ] Teste retornou: ✅ **200 ou sucesso** (não erro)
- [ ] Você fez um pagamento de teste?
- [ ] Monitorou com: `npm run monitor:webhooks`?

---

## 🎯 Fluxo Completo de Teste

```
1. Configurar webhook acima (URL + Secret + Evento)
   ↓
2. Testar webhook no AbacatePay ("Send Test")
   ✅ Deve retornar 200
   ↓
3. Executar: npm run monitor:webhooks
   ↓
4. Fazer pagamento de teste
   ↓
5. Procurar no monitor por: ✅ Webhook recebido: billing.paid
   ↓
6. Voltar para o app e ver: ✅ Pagamento Confirmado!
```

---

## 🆘 Ainda Não Funcionou?

Se depois de configurar o webhook ele ainda não dispara:

### Verificação 1: URL está Acessível?
```bash
curl -X POST https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: qwe123123" \
  -d '{"event":"billing.paid","data":{"billing":{"id":"test","status":"paid"}}}'
```

**Deve retornar:**
```
{"ok": true, "message": "Webhook processado: billing.paid"}
```

### Verificação 2: Logs do Supabase
```
Supabase Dashboard
  → Functions
  → abacatepay-webhook
  → Recent Invocations
```

**Procure por:**
- Invocações recentes (últimos 5 minutos)
- Se houver ❌ vermelhas → clique para ver mensagem de erro

### Verificação 3: Webhook foi mesmo salvo?
1. Volte em AbacatePay → Webhooks
2. Procure pelo URL que você salvou
3. Se não estiver lá → configuração não foi salva (clicar "Salvar" novamente)

---

## 💡 Nota Importante

**Não confunda:**
- ❌ Webhook de **retorno** (redirect após pagamento) = `/payment-confirmation/:id` 
- ✅ Webhook de **confirmação** (notificação do pagador) = `https://...supabase.../functions/v1/abacatepay-webhook`

Ambos precisam estar configurados:
1. Webhook de **confirmação** → configurado AQUI
2. Retorno de **sucesso** → já configurado em `EventDetailPage.tsx` (completionUrl)

---

## 📞 Contato AbacatePay

Se o webhook não funcionar mesmo após todas as tentativas:
1. Abra um ticket no suporte AbacatePay
2. Compartilhe:
   - [ ] URL do webhook
   - [ ] Logs da últimas tentativas
   - [ ] Número de uma transação de teste

Eles podem ajudar a diagnosticar se o webhook está sendo bloqueado.
