# 🔍 Diagnóstico do Erro 400

## ❌ Seu Erro Atual
```
GET https://cwzmiznlvhhnpjgxgsme.supabase.co/rest/v1/payments?... 400 (Bad Request)
```

## 🤔 Problema Provável
Você executou **Query 2** (RLS policies) mas **NÃO executou Query 1** (adicionar colunas)!

O código tenta SELECT:
```
billing_id, payment_method, status, registration_id, amount, transaction_id, created_at
```

Mas se as colunas `billing_id` e `payment_method` não existem → **400 Bad Request**!

---

## ✅ Passo 1: Verificar o Que Existe

Acesse: https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql

Cole e execute:
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments'
ORDER BY ordinal_position;
```

**Anote o resultado** e procure por:
- ✅ `billing_id` (text)
- ✅ `payment_method` (text)

Se vir essas colunas → Vá para **Passo 2**  
Se NÃO vir → Vá para **Passo 3**

---

## ✅ Passo 2: Se as Colunas Existem
Então o problema é apenas RLS. Execute a **Query 2 Corrigida**:

```sql
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated or service can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can view payment by registration" ON public.payments;
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;

CREATE POLICY "Anyone can view payment by registration" ON public.payments FOR SELECT USING (true);
CREATE POLICY "System can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
```

---

## ✅ Passo 3: Se as Colunas NÃO Existem
Execute **Query 1** PRIMEIRO:

```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
```

Depois execute **Query 2 Corrigida** acima.

---

## 🚀 Próximo Passo
Faça um refresh no navegador (Ctrl+F5 ou Cmd+Shift+R) e teste novamente!

Se ainda der erro, compartilhe o resultado do diagnóstico.
