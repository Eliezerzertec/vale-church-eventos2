-- Criar policies RLS que permitem acesso público (sem login)

-- 1. DROP das policies antigas (que estão bloqueando)
DROP POLICY IF EXISTS "Anyone can view payment by registration" ON public.payments;
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;

-- 2. Habilitar RLS (se não estiver)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. Criar nova policy PERMISSIVA para SELECT (qualquer um pode ler)
CREATE POLICY "Everyone can read payments" 
  ON public.payments
  FOR SELECT
  USING (true);

-- 4. Criar policy para INSERT (qualquer um pode criar)  
CREATE POLICY "Everyone can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- 5. Criar policy para UPDATE (qualquer um pode atualizar - será restrito depois)
CREATE POLICY "Everyone can update payments"
  ON public.payments
  FOR UPDATE
  USING (true);

-- 6. Verificar policies
SELECT schemaname, tablename, policyname, permissive, quals
FROM pg_policies
WHERE tablename = 'payments';
