## Aplicar Migrations - Corrigir Tabela Payments

**Problema:** Erro 400 ao consultar payments causado por:
1. Colunas `billing_id` e `payment_method` não existem
2. RLS policies muito restritivas bloqueiam consultas públicas

**Solução:** Execute 2 queries no SQL Editor do Supabase

### Passo 1: Acesse o SQL Editor
1. Vá para: https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql
2. Crie uma nova query clicando em **"New query"**

### Passo 2: Primeira Query - Adicionar Colunas
Cole e execute:
```sql
-- Add missing payment fields
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
```
✅ Você deve ver: `Success. No rows returned`

### Passo 3: Segunda Query - Corrigir RLS
Crie uma **nova query** e cole:
```sql
-- Fix RLS for payments table - allow public access by registration_id
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated or service can insert payments" ON public.payments;

-- SELECT: Anyone can view payment status (needed for payment confirmation page)
CREATE POLICY "Anyone can view payment by registration" ON public.payments FOR SELECT USING (true);

-- INSERT: Only allow during webhook processing (service role) or with proper auth
CREATE POLICY "System can insert payments" ON public.payments FOR INSERT WITH CHECK (true);

-- UPDATE: Only admins or webhook service
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- DELETE: Only admins
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
```
✅ Você deve ver: `Success. No rows returned`

### Passo 4: Verificação
Após executar ambas as queries:
1. Vá para aba **Tables** e procure por `payments`
2. Confirme que os novos campos aparecem:
   - `billing_id` (TEXT)
   - `payment_method` (TEXT, default: 'pix')
3. Clique na aba **Policies** da tabela e confirme que há 5 policies:
   - Anyone can view payment by registration (SELECT)
   - System can insert payments (INSERT)
   - Admins can update payments (UPDATE)
   - Admins can delete payments (DELETE)

---

**Por quê?** 
- O aplicativo tenta consultar campos que não existem → erro 400
- RLS policy só permitia acesso se autenticado com user_id → erro para pagamentos públicos
- Solução: Permitir SELECT público + adicionar as colunas de metadados

**Próximo passo:** Após aplicar ambas, reinicie o frontend (`npm run dev`) e teste novamente!
