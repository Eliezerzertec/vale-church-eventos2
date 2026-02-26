-- MIGRAÇÃO 1
-- Copie do ALTER abaixo até o ; (ponto e vírgula)
-- Depois clique em Execute

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';


-- ========================================
-- MIGRAÇÃO 2: Corrigir RLS policies
-- ========================================
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


-- ========================================
-- MIGRAÇÃO 3: Adicionar receipt_url
-- ========================================
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;


-- ========================================
-- MIGRAÇÃO 4: Adicionar campos de cupom
-- ========================================
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;


-- MIGRAÇÃO 5 - VERSÃO SIMPLIFICADA
-- Sem foreign key para events (evita erro se tabela não existir)

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS event_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS registration_email TEXT,
ADD COLUMN IF NOT EXISTS registration_name TEXT,
ADD COLUMN IF NOT EXISTS payment_url TEXT;
