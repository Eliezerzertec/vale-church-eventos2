# 🚀 Executar Migrações no Supabase

Para que o sistema de cupons e pagamentos funcione corretamente, você precisa executar as migrações SQL no Supabase.

## Passos:

1. **Acesse o Supabase**
   - Vá para: https://app.supabase.com/
   - Projeto: **cwzmiznlvhhnpjgxgsme**

2. **Abra SQL Editor**
   - No menu esquerdo, clique em **SQL Editor**
   - Clique em **New Query**

3. **Execute cada migração em ordem**

---

### ✅ Migração 1: Adicionar campos de pagamento

```sql
-- Add missing payment fields
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
```

Clique em **Execute** (Ctrl+Enter)

---

### ✅ Migração 2: Corrigir RLS policies

```sql
-- Politique para SELECT público
CREATE POLICY "Pagamentos - SELECT público" 
ON public.payments FOR SELECT 
USING (true);

-- Política para INSERT do sistema
CREATE POLICY "Pagamentos - INSERT sistema" 
ON public.payments FOR INSERT 
WITH CHECK (true);

-- Política para UPDATE do admin
CREATE POLICY "Pagamentos - UPDATE admin" 
ON public.payments FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Política para DELETE do admin
CREATE POLICY "Pagamentos - DELETE admin" 
ON public.payments FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);
```

---

### ✅ Migração 3: Adicionar receipt_url

```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;
```

---

### ✅ Migração 4: Adicionar campos de cupom

```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
```

---

### ✅ Migração 5: Adicionar event_id e updated_at (opcional)

```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS registration_email TEXT,
ADD COLUMN IF NOT EXISTS registration_name TEXT,
ADD COLUMN IF NOT EXISTS payment_url TEXT;
```

---

## ✅ Depois de executar:

1. Atualize a página do seu app (F5)
2. Tente fazer um pagamento com cupom
3. Verifique se funciona!

## 🔍 Troubleshoot

Se tiver erro `column already exists`, é porque a coluna já foi criada. Ignore o erro e continue com a próxima migração.

Se tiver erro de `permission denied`, verifique se você está logado como administrador do projeto Supabase.
