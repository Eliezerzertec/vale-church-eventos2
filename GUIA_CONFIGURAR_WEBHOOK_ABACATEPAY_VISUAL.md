# 🎬 Passo-a-Passo: Configurar Webhook no AbacatePay

## 🌐 Acesso ao Dashboard

### Passo 1: Login
```
URL: https://app.abacatepay.com
(ou seu dashboard AbacatePay)

Usuário: seu@email.com
Senha: sua_senha

Depois de logar → Dashboard
```

---

## ⚙️ Navegação até Webhooks

### Passo 2: Ir para Configurações
```
Dashboard
  ↓
Menu esquerdo ou Ícone ⚙️ (canto superior)
  ↓
"Configurações" ou "Settings"
  ↓
Procure por seção tipo:
  • "Integrações"
  • "APIs"
  • "Webhooks"
  • "Notificações"
```

**Ou acesso direto (se disponível):**
```
https://app.abacatepay.com/settings/webhooks
```

### Passo 3: Abrir Webhooks
```
Encontrar seção: "📡 Webhooks" ou "Integrações"
  ↓
Clique em: "Gerenciar Webhooks" ou "Webhooks"
  ↓
Você verá lista com webhooks existentes(se houver)
```

---

## ➕ Adicionar Novo Webhook

### Passo 4: Novo Webhook

**Procure por botão:**
- [ ] "Adicionar Webhook"
- [ ] "Add Webhook"
- [ ] "+ Novo"
- [ ] "+ Webhook"

**Clique nele**

---

## 📝 Preencher Formulário

### Campo 1: URL do Webhook
```
Label: "URL" ou "Webhook URL"

Copie e cole EXATAMENTE:
┌─────────────────────────────────────────────────┐
│ https://cwzmiznlvhhnpjgxgsme.supabase.co/      │
│ functions/v1/abacatepay-webhook                 │
└─────────────────────────────────────────────────┘

❌ NÃO use:
  • http:// (precisa ser https://)
  • Sem /functions/v1/
  • Domínio diferente
  • Com "localhost"
```

### Campo 2: Chave Secreta / Secret Key
```
Label: "Chave" ou "Secret" ou "Auth Token"

Copie e cole EXATAMENTE:
┌─────────────────────────────────────────────────┐
│ qwe123123                                        │
└─────────────────────────────────────────────────┘

❌ NÃO use:
  • Valor diferente
  • Com espaços
  • Com caracteres especiais removidos
```

### Campo 3: Eventos
```
Label: "Eventos" ou "Events" ou "Tipos de Eventos"

Procure por checkbox ou dropdown:
  ☑ billing.paid         ← SELECIONE ESTE
  ☐ billing.failed
  ☐ billing.expired
  ☐ billing.refunded
  ☐ payment.received
  ☐ (outros eventos)

ℹ️ Se houver apenas lista:
  • Procure por filtro tipo "Quais eventos?"
  • Ou "Event types"
  • Selecione: billing.paid (ou equivalente: "Pagamento Confirmado")
```

### Campo 4: Status / Ativo
```
Label: "Ativo" ou "Habilitado" ou "Enabled"

IMPORTANTE: Certifique-se de LIGAR:
  ☑ Ativo / Enabled / Active

❌ Não deixe:
  ☐ Inativo / Disabled
```

### Campo 5: Outras Opções (Opcional)
```
Você pode ver também:
  • Descrição: "Webhook de Confirmação de Pagamento"
  • Método HTTP: POST (já pré-preenchido)
  • Content-Type: application/json (pré-preenchido)
  • Timeout: 30 segundo (deixar padrão)
  • Retry: SIM / Automático (recomendado)

Deixe como estão (não precisa mudar)
```

---

## 💾 Salvar

### Passo 5: Salvar Webhook

**Procure por botão:**
- [ ] "Salvar"
- [ ] "Save"
- [ ] "Criar"
- [ ] "Create"
- [ ] "Confirmar"

**Clique nele**

---

## ✅ Confirmação

Após salvar, você deve ver uma mensagem tipo:

```
✅ Webhook criado com sucesso!

URL: https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
Status: Ativo ✓
Eventos: billing.paid
Criado em: 2026-02-23 14:35

ID do Webhook: webhook_...
```

Ou você pode voltar para lista e ver:

```
┌─────────────────────────────────────────────────────────────┐
│ Webhook                             Status   Eventos        │
├─────────────────────────────────────────────────────────────┤
│ ...supabase.co/functions/v1/...      ✓ Ativo  billing.paid  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Teste Imediato (Dentro do AbacatePay)

Se o AbacatePay oferecer opção de teste dentro do painel:

### Passo 6: Enviar Teste

**Dentro da lista de webhooks:**
1. Encontre o webhook que criou
2. Clique em: "Testar" ou "Test" ou "Enviar Teste"

**Você deve ver:**
```
✅ Webhook enviado
Status: 200 OK
Resposta: {"ok": true, "message": "Webhook processado: billing.paid"}
```

Se algo como "401" ou erro → **PROBLEMA**
- Checar secret
- Checar URL
- Ver guia "Troubleshooting" abaixo

---

## 📸 Screenshots Esperados

### Screenshot 1: Página de Webhooks (Vazia)
```
┌─────────────────────────────────────────────────┐
│ ⚙️ Configurações > Webhooks                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  Nenhum webhook configurado                     │
│                                                  │
│  [ + Adicionar Webhook ]                        │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Screenshot 2: Formulário Preenchido
```
┌─────────────────────────────────────────────────┐
│ Novo Webhook                                     │
├─────────────────────────────────────────────────┤
│                                                  │
│ URL do Webhook                                   │
│ https://cwzmiznlvhhnpjgxgsme.supabase.co/...   │
│                                                  │
│ Chave Secreta                                    │
│ qwe123123                                        │
│                                                  │
│ Eventos                                          │
│ ☑ billing.paid                                   │
│                                                  │
│ Status                                           │
│ ☑ Ativo                                          │
│                                                  │
│               [ Salvar ]  [ Cancelar ]           │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Screenshot 3: Sucesso
```
┌─────────────────────────────────────────────────┐
│ ✓ Webhook criado com sucesso!                   │
│                                                  │
│ URL: https://cwzmiznlvhhnpjgxgsme...            │
│ Status: Ativo                                    │
│ Eventos: billing.paid                            │
│                                                  │
│ [ Testar ] [ Editar ] [ Deletar ]               │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Teste Terminal (Alternativo)

Se quiser testar SEM usar painel:

### Terminal 1: Monitorar
```bash
cd d:\DESENVOLVIMENTO...
npm run monitor:webhooks
```

Deixe rodando

### Terminal 2: Enviar Webhook de Teste
```bash
$billingId = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$body = @{
    event = "billing.paid"
    data = @{
        billing = @{
            id = $billingId
            status = "paid"
        }
    }
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-Webhook-Secret" = "qwe123123"
}

Invoke-WebRequest `
  -Uri "https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook" `
  -Method POST `
  -Headers $headers `
  -Body $body `
  -UseBasicParsing

Write-Host "✓ Webhook enviado com billing_id: $billingId"
```

### Terminal 1 deve mostrar:
```
✅ Webhook recebido: billing.paid
   billing_id: TEST-20260223-143520
   status: 200
```

---

## ❌ Troubleshooting

### Erro 1: "404 Not Found"
```
Causa: URL incorreta

Solução:
  1. Copiar URL de novo (sem erros)
  2. Usar EXATAMENTE:
     https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook
  3. Não é localhost
  4. Não é HTTP (precisa ser HTTPS)
```

### Erro 2: "401 Unauthorized"
```
Causa: Secret incorreto

Solução:
  1. Copiar secret de novo
  2. Usar EXATAMENTE: qwe123123
  3. Sem espaços extras
  4. Sem caracteres especiais alterados
```

### Erro 3: "Connection Timeout"
```
Causa: Edge Function pode estar offline

Solução:
  1. Aguardar 1-2 minutos
  2. Tentar de novo
  3. Verificar Supabase → Functions → Status
  4. Ou tentar teste com curl primeiro
```

### Erro 4: "Webhook recebido mas página não muda"
```
Causa: RLS bloqueando updates no banco

Solução:
  1. Ir: Supabase Dashboard
  2. Authentication → Policies
  3. Procurar por "payments"
  4. Ver se há policies muito restritivas
  5. Desabilitar se necessário
```

---

## 📋 Checklist Final

- [ ] Login no AbacatePay
- [ ] Navegou para Webhooks
- [ ] Clicou "Adicionar Webhook"
- [ ] Preencheu URL (https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook)
- [ ] Preencheu Secret (qwe123123)
- [ ] Selecionou Evento (billing.paid)
- [ ] Marcou como "Ativo"
- [ ] Clicou "Salvar"
- [ ] Viu mensagem "Criado com sucesso"
- [ ] (Opcional) Testou webhook no painel
- [ ] (Opcional) Testou com curl/PowerShell

---

## ✨ Próximo Passo

Depois de configurar no AbacatePay:

```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev

# Terminal 3
npm run monitor:webhooks
```

Depois acesse http://localhost:8081 e faça um pagamento de teste! 💳

---

**Data:** 23 de Fevereiro de 2026
**Versão:** 1.0 - Guia Visual Completo
