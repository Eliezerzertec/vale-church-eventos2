# 🔧 Como Aplicar as Correções no Supabase (Passo a Passo)

## ❌ Problema Atual
```
GET https://cwzmiznlvhhnpjgxgsme.supabase.co/rest/v1/payments?... 400 (Bad Request)
```

Causado por:
1. Colunas `billing_id` e `payment_method` não existem
2. Policies RLS bloqueiam consultas públicas

---

## ✅ Solução: 5 Passos Simples

### Step 1️⃣: Abra o SQL Editor do Supabase
1. Acesse: https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql
2. Você verá uma página com editor de SQL em branco
3. Clique em **"New query"** ou **"New SQL file"** se não houver query aberta

### Step 2️⃣: Executar Query 1 - Adicionar Colunas
Copie e cole no editor:

```sql
-- Add missing payment fields
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
```

Clique em **"RUN"** (botão azul no canto superior direito, ou `Ctrl + Enter`)

✅ **Esperado:** `Success. No rows returned`

---

### Step 3️⃣: Executar Query 2 - Corrigir RLS Policies
Crie uma **nova query** (botão "New query" novamente)

Copie e cole:

```sql
-- Fix RLS for payments table - allow public access
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated or service can insert payments" ON public.payments;

-- SELECT: Anyone can view payment status
CREATE POLICY "Anyone can view payment by registration" ON public.payments 
  FOR SELECT USING (true);

-- INSERT: Allow system/webhooks to insert
CREATE POLICY "System can insert payments" ON public.payments 
  FOR INSERT WITH CHECK (true);

-- UPDATE: Only admins
CREATE POLICY "Admins can update payments" ON public.payments 
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- DELETE: Only admins
CREATE POLICY "Admins can delete payments" ON public.payments 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
```

Clique em **"RUN"**

✅ **Esperado:** `Success. No rows returned`

---

### Step 4️⃣: Verificar as Alterações
1. Vá para a aba **"Tables"** (esquerda)
2. Procure e clique em `payments`
3. Clique na aba **"Columns"** e confirme:
   - ✅ `billing_id` (text)
   - ✅ `payment_method` (text)
4. Clique na aba **"Policies"** e confirme que há 5 policies:
   - Anyone can view payment by registration (SELECT)
   - System can insert payments (INSERT)
   - Admins can update payments (UPDATE)
   - Admins can delete payments (DELETE)

### Step 5️⃣: Reiniciar Frontend
Volte ao VS Code terminal:

```powershell
npm run dev
```

Agora acesse: `http://192.168.2.104:8080/eventos`

Tente comprar um evento e o erro 400 **deve desaparecer**! ✨

---

## 🐛 Se Ainda Não Funcionar

**Debug passo:**
1. Abra DevTools (F12) → Console
2. Tente comprar novamente
3. Procure por mensagens de erro
4. Copie e envie o erro completo

**Possíveis causas:**
- Queries não foram executadas corretamente
- Cache do navegador (Ctrl+Shift+Delete)
- Frontend não foi recarregado (F5)

---

## 📝 Resumo do Que Foi Feito

| Etapa | Ação | Status |
|-------|------|--------|
| Query 1 | Adicionar colunas a `payments` | ⏳ Pendente execução |
| Query 2 | Corrigir RLS policies | ⏳ Pendente execução |
| Verificação | Confirmar colunas e policies | ⏳ Pendente verificação |
| Frontend | Reiniciar para carregar mudanças | ⏳ Pendente reload |

---

## 🆘 Precisa de Ajuda?

Se receber qualquer erro ao executar as queries, copie a mensagem de erro e compartilhe!
