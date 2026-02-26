# 📋 Scripts de Gerenciamento de Pagamentos

Estes scripts permitem você **sincronizar e gerenciar o status de pagamentos** diretamente do banco de dados local, sem depender de APIs externas.

## 🚀 Scripts Disponíveis

### 1️⃣ **confirm-all-payments.js** - Confirmar Todos os Pagamentos Pendentes
```bash
node confirm-all-payments.js
```

**O que faz:**
- Lista todos os pagamentos com status `pending`
- Atualiza para `paid` na tabela `payments`
- Atualiza correspondente `event_registrations` para `confirmed`
- Mostra resumo com quantos foram confirmados

**Uso:** Execute quando quiser confirmar em lote todos os pagamentos pendentes testing.

---

### 2️⃣ **confirm-remaining.js** - Confirmar Inscrições Pendentes
```bash
node confirm-remaining.js
```

**O que faz:**
- Busca inscrições com status `pending`
- Atualiza cada uma para `confirmed`
- Ideal quando alguns registros ficaram pendentes

**Uso:** Execute para confirmar rapidamente qualquer inscrição não processada.

---

### 3️⃣ **check-inscriptions.js** - Verificar Status de Inscrições
```bash
node check-inscriptions.js
```

**O que faz:**
- Lista as últimas 10 inscrições
- Mostra status (✅ confirmada, ⏳ pendente, ❌ rejeitada)
- Exibe resumo de contagens

**Uso:** Execute para rastrear e validar o progresso do processamento.

---

### 4️⃣ **update-payments-interactive.js** - Atualizar Manualmente (Interativo)
```bash
node update-payments-interactive.js
```

**O que faz:**
- Lista todos os pagamentos pendentes
- Oferece menu para escolher qual atualizar
- Permite selecionar novo status:
  - `paid` (confirmado)
  - `failed` (falhou)
  - `pending` (manter)
- Atualiza `payments` e `event_registrations` simultaneamente

**Uso:** Use quando precisa controle total sobre quais pagamentos confirmar.

---

### 5️⃣ **sync-payments.js** - Sincronizar com AbacatePay (API)
```bash
node sync-payments.js
```

**O que faz:**
- Busca pagamentos pendentes no banco local
- Consulta AbacatePay API para status real
- Atualiza local com novo status
- Trata o mapeamento de status automaticamente

**Status:** ⚠️ Atualmente com erro de permissão da API (ver seção de troubleshooting)

---

## 🔄 Fluxo de Uso Recomendado

### **Para Testes/Desenvolvimento:**
```bash
# 1. Ver quantas inscrições pendentes
node check-inscriptions.js

# 2. Confirmar todas de uma vez
node confirm-all-payments.js

# 3. Verificar resultado
node check-inscriptions.js
```

### **Para Controle Granular:**
```bash
# Operações manuais interativas
node update-payments-interactive.js
```

### **Para Automação (Quando API funcionar):**
```bash
# Sincronizar automaticamente com AbacatePay
node sync-payments.js
```

---

## 📊 Estrutura de Dados

### Tabela `payments`
```
id (UUID)
billing_id (string)
registration_id (UUID) -> event_registrations.id
status (pending | paid | failed)
registration_name (string)
created_at (timestamp)
updated_at (timestamp)
```

### Tabela `event_registrations`
```
id (UUID)
full_name (string)
email (string)
status (pending | confirmed | rejected)
event_id (UUID)
created_at (timestamp)
updated_at (timestamp)
```

---

## 🔗 Mapeamento de Status

Ao confirmar um pagamento:

```
PAYMENT TABLE               EVENT_REGISTRATIONS TABLE
pending         ─────>      pending
paid            ─────>      confirmed
failed          ─────>      rejected
```

---

## ⚠️ Troubleshooting

### Erro: "Could not find the 'X' column"
**Solução:** O nome da coluna não existe no banco. Verifique em `Tools > SQL Editor` do Supabase qual é o nome exato.

### Erro: "Insufficient permissions" (sync-payments.js)
**Causa:** A chave de API do AbacatePay não tem permissão de leitura.

**Soluções:**
1. Verifique em seu painel AbacatePay se a chave tem permissão
2. Use `confirm-all-payments.js` como workaround
3. Aguarde resposta do suporte AbacatePay

### Script não encontra variáveis de ambiente
**Solução:** Verifique se `.env` existe na raiz do projeto com:
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_ABACATEPAY_DEV_KEY=...
```

---

## 🎯 Resumo Rápido

| Script | Função | Modo | Quando Usar |
|--------|--------|------|------------|
| check-inscriptions | Ver status | Leitura | Sempre que quiser verificar |
| confirm-all-payments | Confirmar tudo | Automático | Aprovar em lote |
| confirm-remaining | Confirmar restantes | Automático | Pegar as que faltaram |
| update-payments-interactive | Controle manual | Interativo | Casos específicos |
| sync-payments | Sincronizar API | Automático | Quando funcionar |

---

## 📝 Exemplo de Execução

```bash
$ node check-inscriptions.js
📊 === Status das Inscrições ===
Total de inscrições: 10
⏳ João Silva - pendente
✅ Maria Santos - confirmada
...
📈 RESUMO:
✅ Confirmadas: 1
⏳ Pendentes: 9

$ node confirm-all-payments.js
🚀 === Confirmar Todos os Pagamentos Pendentes ===
📦 Encontrados 3 pagamento(s)
✅ Confirmado: João Silva
✅ Confirmado: Maria Santos
...
✅ 10/10 confirmados com sucesso!

$ node check-inscriptions.js
📈 RESUMO:
✅ Confirmadas: 10
⏳ Pendentes: 0
```

---

## 📚 Arquivos Relacionados

- **Backend:** `server.js` - Proxy para AbacatePay
- **Frontend:** `src/pages/PaymentConfirmationPage.tsx` - Página de confirmação com polling
- **Config:** `.env` - Variáveis de ambiente necessárias
- **Docs:** `IMPLEMENTACAO_STATUS.md` - Status geral do projeto

---

**Última atualização:** Fevereiro 2026
