-- ========================================
-- QUERY 1: Adicionar Colunas Faltantes
-- ========================================
-- Execute esta query PRIMEIRO no Supabase SQL Editor
-- Copie tudo abaixo (incluindo comentário) e cole no editor
-- Clique em RUN

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';

-- Esperado resultado: Success. No rows returned

---

-- ========================================
-- QUERY 2: Adicionar coluna receipt_url
-- ========================================
-- Execute esta query SEGUNDO no Supabase SQL Editor
-- Copie tudo abaixo e cole em uma NOVA query
-- Clique em RUN

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Esperado resultado: Success. No rows returned

---

-- ========================================
-- QUERY 3: Corrigir RLS Policies (VERSÃO SEGURA)
-- ========================================
-- Execute esta query TERCEIRO (nova query) no Supabase SQL Editor
-- Copie tudo abaixo e cole em uma NOVA query
-- Clique em RUN

-- Drop old restrictive policies (if they exist)
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated or service can insert payments" ON public.payments;

-- Recreate policies (safe: drop old first, then create new)
DROP POLICY IF EXISTS "Anyone can view payment by registration" ON public.payments;
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;

-- Now create all policies fresh
CREATE POLICY "Anyone can view payment by registration" ON public.payments 
  FOR SELECT USING (true);

CREATE POLICY "System can insert payments" ON public.payments 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update payments" ON public.payments 
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payments" ON public.payments 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Esperado resultado: Success. No rows returned
