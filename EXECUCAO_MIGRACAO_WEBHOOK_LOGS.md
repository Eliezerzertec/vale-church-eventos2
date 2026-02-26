# 🗄️ Executar Migração webhook_logs no Supabase

## Opção 1: Via SQL Editor (Recomendado)

### Passo 1: Abrir SQL Editor

1. Vá para: **https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme**
2. Menu esquerdo → **SQL Editor**
3. Clique em **+ New Query**

### Passo 2: Copiar SQL

⚠️ **IMPORTANTE:** Copie APENAS o código SQL, SEM os delimitadores markdown!

Abra o arquivo: `MIGRAÇÃO_6_WEBHOOK_LOGS.sql`

**Copie ESTE BLOCO EXATAMENTE (sem os ``` acima e abaixo):**

```sql
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  billing_id TEXT NOT NULL,
  status TEXT,
  request_body JSONB,
  response_status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX webhook_logs_billing_id_idx ON public.webhook_logs(billing_id);
CREATE INDEX webhook_logs_created_at_idx ON public.webhook_logs(created_at DESC);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable select for authenticated users" ON public.webhook_logs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON public.webhook_logs
  FOR INSERT WITH CHECK (true);
```

**NÃO COPIE:**
- ❌ Os três acentos grave ``` do início
- ❌ A palavra "sql" depois dos acentos
- ❌ Os três acentos grave do final

### Passo 3: Colar no Supabase

1. Clique na área branca do SQL Editor (abaixo de "New Query")
2. Cole (Ctrl+V)
3. O editor deve mostrar exatamente isto (iniciando com CREATE TABLE):

```
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
```

❌ **Se aparecer isto (com acentos grave), está errado:**
```
```sql
CREATE TABLE IF NOT EXISTS public.webhook_logs (
...
```

Se isto acontecer:
- Pressione Escape
- Limpe tudo (Ctrl+A, Delete)
- Tente copiar novamente do arquivo, sem os delimitadores markdown

### Passo 4: Executar Query

1. Pressione **Ctrl+Enter** (ou clique no botão ▶️ Play)
2. Aguarde 2-5 segundos

### Passo 5: Confirmar Sucesso

Você verá uma mensagem verde:

```
✅ Query executed successfully
```

---

## Opção 2: Via Dashboard Tables (Se preferir)

1. Menu esquerdo → **Table Editor**
2. Clique em **Create a new table**
3. Nome: `webhook_logs`
4. Adicione colunas:
   - `id` (UUID, Primary Key)
   - `event` (Text)
   - `billing_id` (Text)
   - `status` (Text)
   - `request_body` (JSON)
   - `response_status` (Text)
   - `error_message` (Text)
   - `created_at` (Timestamp, default: now())

⚠️ **Aviso:** Esta opção é mais lenta e você precisa criar índices manualmente!

---

## Verificar se Foi Criado

Depois de executar a migração:

### 1️⃣ Verificar Tabela

1. Menu esquerdo → **Table Editor**
2. Procure por `webhook_logs` na lista
3. Se aparecer, ✅ sucesso!

### 2️⃣ Fazer Query de Teste

No SQL Editor, execute:

```sql
SELECT COUNT(*) as total FROM public.webhook_logs;
```

Resultado esperado:
```
total
------
  0
(1 row)
```

Se vir `0`, a tabela está vazia e pronta para receber webhooks.

---

## Troubleshooting

### ❌ Erro: "relation 'webhook_logs' already exists"

**Significa:** A tabela já foi criada antes.

**Solução:** Tudo OK! Siga normalmente para testar webhooks.

### ❌ Erro: "permission denied for schema public"

**Significa:** Problema de permissão no Supabase.

**Solução:**
1. Verifique se está logado como administrador
2. Tente executar apenas a parte da tabela (sem RLS policies)

### ❌ Erro: "syntax error"

**Significa:** Existe caractere especial no SQL.

**Solução:**
1. Copie direto do arquivo `MIGRAÇÃO_6_WEBHOOK_LOGS.sql`
2. Não adicione explicações ou comentários manualmente

### ✅ Sucesso: Tabela criada

Agora você pode:
- Testar webhooks com `npm run monitor:webhooks`
- Ver logs em tempo real
- Debugar falhas de pagamento

---

## Próximo: Testar

Depois de confirmar que a tabela foi criada:

```bash
npm run dev:backend
npm run monitor:webhooks
npm run dev  # em outro terminal
```

Vá para http://192.168.2.104:8081 e teste um pagamento!

---

**Criado em:** 23/02/2025
