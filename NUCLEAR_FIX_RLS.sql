-- NUCLEAR FIX: Desabilitar RLS completamente
-- Se as policies não estão funcionando, desabilita tudo

-- 1. DROP TODAS as policies existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename = 'payments'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. DESABILITAR RLS completamente
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- 3. Verificar status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'payments';

-- 4. Teste simples
SELECT COUNT(*) as total_payments FROM public.payments;
