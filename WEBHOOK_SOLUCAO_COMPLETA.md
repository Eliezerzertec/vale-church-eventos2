# 🔧 SOLUÇÃO: Webhook Não Chega e Não Confirma

## O Problema
```
❌ Webhook NÃO chega no servidor
❌ Inscrição NÃO confirma após pagamento
❌ Status fica **pendente** para sempre
```

## A Causa Raiz
O seu backend Express está rodando em **`localhost:3001`** (seu computador).

O AbacatePay está em um **servidor externo na internet**.

**Servidores externos NÃO conseguem acessar servidores em localhost.**

É como tentar acessar o endereço "minha casa" de alguém que está em outro país - não funciona.

---

## ✅ Solução Rápida (Desenvolvimento)

### Passo 1: Instalar ngrok
```bash
# Windows + PowerShell ou CMD
# Baixar de: https://ngrok.com/download

# Ou se tiver Chocolatey:
choco install ngrok
```

### Passo 2: Iniciar ngrok
```bash
# Abra um novo terminal/PowerShell
cd C:\Users\SeuUsuario\Downloads  # ou onde ngrok está
./ngrok http 3001
```

### Passo 3: Copiar a URL
Você vai ver algo assim:
```
ngrok                     (Ctrl+C to quit)

Session Status                online
Account                       seu@email.com (Plan: Free)
Version                       3.0.7

Web Interface                 http://127.0.0.1:4040
Forwarding                    https://XXXX-XXXXX.ngrok.io -> http://localhost:3001
```

**Copie esta URL:** `https://XXXX-XXXXX.ngrok.io` (será diferente na sua máquina)

### Passo 4: Configurar no AbacatePay
1. Acesse: https://abacatepay.com (seu dashboard)
2. Vá em: **Configurações → Webhooks**
3. Clique em **"Adicionar Webhook"** (ou edite o existente)
4. Preencha:
   - **URL:** `https://XXXX-XXXXX.ngrok.io/api/webhook/abacatepay`
   - **Secret:** `qwe123123`
   - **Evento:** `billing.paid`
   - **Ativo:** ✅ Ligado

5. Clique **"Salvar"**

### Passo 5: Testar
```bash
# No AbacatePay dashboard, vá no webhook que acabou de criar
# Clique em "Enviar Teste" ou "Send Test"
```

No seu terminal do Node (onde está rodando `node server.js`), você deve ver:
```
🔔 [WEBHOOK] Requisição recebida
   Hora: 26/02/2026 14:30:45
✅ Secret validado
📌 Webhook ID: wh_test_...
📌 Evento: billing.paid
🔧 Mode: 🔴 PROD
💳 Billing: bill_...
💰 Valor: R$ 50,00
✅ Status: PAID
```

---

## Verificação: O Webhook Funciona?

### ✅ Se viu a mensagem acima:
1. O webhook chegou com sucesso ✅
2. Vá em seu banco de dados (Supabase)
3. Procure por um registro na tabela `event_registrations`
4. O status deve estar **"confirmed"** (em verde)

### ❌ Se NADA aparecer:
1. Certifique-se que ngrok está rodando (não feche o terminal)
2. A URL do ngrok mudou? (muda a cada vez que reinicia)
3. Copie a URL novo no AbacatePay novamente
4. Tente o teste novamente

---

## Checklist Full Flow

Após ngrok estar funcionando:

```bash
# Terminal 1: Backend
cd "d:\DESENVOLVIMENTO APP WEB\Nova pasta\Eventos-Church-Lavras\vale-church-manager"
node server.js

# Terminal 2: ngrok (deixe rodando)
ngrok http 3001

# Terminal 3: Frontend (opcional)
npm run dev
```

Depois:
1. [ ] Abra um navegador em `http://localhost:8080`
2. [ ] Crie um evento
3. [ ] Inscreva-se no evento
4. [ ] Faça um pagamento (PIX de teste)
5. [ ] Espere a confirmação aparecer

**Esperado:**
- ✅ Inscrição muda de "Pendente" para "Confirmada"
- ✅ Terminal mostra logs webhook
- ✅ Banco de dados atualiza status

---

## Alternativa: Deploy em Produção

Se ngrok é complicado, você pode fazer **deploy**:

### Opção A: Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

Isso gera uma URL pública como:
```
https://seu-app.vercel.app/api/webhook/abacatepay
```

### Opção B: Seu próprio servidor
Se tiver um servidor/domínio:
```
https://seu-dominio.com/api/webhook/abacatepay
```

---

## Status do Backend

Para verificar se o backend está ok:
```bash
# Abra um navegador ou PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET

# Esperado:
# {"status":"ok","message":"Backend de pagamentos ativo",...}
```

---

## Logs em Tempo Real

Para ver os webhooks em tempo real enquanto testam:
```bash
node "test-webhook-with-existing-payment.js"
```

Isso:
1. Pega um pagamento pendente do banco
2. Simula um webhook como se viesse do AbacatePay
3. Mostra se a inscrição foi confirmada

---

## 💡 Resumo Rápido

| Problema | Causa | Solução |
|----------|-------|---------|
| Webhook não chega | localhost não é público | Usar ngrok ou deploy |
| Inscrição não confirma | webhook não chega | Use ngrok/deploy |
| "Permissão negada" | Secret errado | Verificar: `qwe123123` |
| 404 Not Found | URL errada | Deve ser `/api/webhook/abacatepay` |

---

## ⚡ Próximas Ações

**AGORA:**
```bash
1. Instalar ngrok
2. Executar: ngrok http 3001
3. Copiar URL
4. Configurar no AbacatePay Dashboard
5. Testar no dashboard: "Send Test"
```

**DEPOIS:**
```bash
1. Criar um pagamento de teste
2. Completar o pagamento
3. Verificar se inscrição confirmou
```

**EM PRODUÇÃO:**
```bash
1. Deploy do backend em Vercel
2. Atualizar URL no AbacatePay (remover ngrok)
3. Tudo funcionará automaticamente
```

---

## 🆘 Ainda não funciona?

Se seguiu tudo e ainda não funciona, verifique:

1. **ngrok está rodando?** (não feche o terminal)
2. **URL foi copiado corretamente?** (com https://)
3. **NgrokURL mudou?** (muda a cada reinicio, copiar de novo)
4. **Secret está correto?** (deve ser exatamente: `qwe123123`)
5. **Backend está ativo?** (rodar: `node server.js`)
6. **Porta 3001 está libre?** (verificar: `netstat -ano | findstr :3001`)

Se tudo acima foi feito, abra uma issue com:
- Prints da tela do AbacatePay
- Output do ngrok
- Output do `node server.js`
- Erro específico que recebe

---

**Boa sorte! 🚀**
