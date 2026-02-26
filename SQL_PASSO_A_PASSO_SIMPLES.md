# ⚠️ INSTRUÇÕES CRÍTICAS PARA EVITAR ERRO

## ❌ ERRADO - NÃO FAÇA ISSO:
Copiar incluindo os backticks:
```
```sql
ALTER TABLE...
```
```

---

## ✅ CORRETO - FAÇA ASSIM:

1. **Selecione APENAS** o código entre os backticks
2. **NÃO selecione** os ` ` ` sql
3. **NÃO selecione** os ` ` ` do final
4. Cole no Supabase

---

## 📋 PASSO A PASSO:

### MIGRAÇÃO 1

**COPIE ISTO (começa em ALTER e termina em ;):**

```
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
```

- [ ] Cole no SQL Editor do Supabase
- [ ] Clique em **Execute** (Ctrl+Enter)

---

### MIGRAÇÃO 2

**COPIE ISTO:**

```
DROP POLICY IF EXISTS "Pagamentos - SELECT público" ON public.payments;
DROP POLICY IF EXISTS "Pagamentos - INSERT sistema" ON public.payments;
DROP POLICY IF EXISTS "Pagamentos - UPDATE admin" ON public.payments;
DROP POLICY IF EXISTS "Pagamentos - DELETE admin" ON public.payments;

CREATE POLICY "Pagamentos - SELECT público" 
ON public.payments FOR SELECT 
USING (true);

CREATE POLICY "Pagamentos - INSERT sistema" 
ON public.payments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Pagamentos - UPDATE admin" 
ON public.payments FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

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

- [ ] Cole no SQL Editor
- [ ] Clique em **Execute**

---

### MIGRAÇÃO 3

**COPIE ISTO:**

```
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;
```

- [ ] Cole no SQL Editor
- [ ] Clique em **Execute**

---

### MIGRAÇÃO 4

**COPIE ISTO:**

```
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
```

- [ ] Cole no SQL Editor
- [ ] Clique em **Execute**

---

### MIGRAÇÃO 5

**COPIE ISTO:**

```
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS event_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS registration_email TEXT,
ADD COLUMN IF NOT EXISTS registration_name TEXT,
ADD COLUMN IF NOT EXISTS payment_url TEXT;
```

- [ ] Cole no SQL Editor
- [ ] Clique em **Execute**

---

## 🎉 FIM!

Atualize a página e tudo funcionará.
