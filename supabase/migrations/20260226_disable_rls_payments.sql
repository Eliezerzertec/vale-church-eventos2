-- Migração para desabilitar RLS na tabela payments
-- Executar no Supabase SQL Editor

-- 1. Verificar status atual
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'payments';

-- 2. Desabilitar RLS
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se foi desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'payments';

-- 4. Testar leitura simples
SELECT id, billing_id, status FROM public.payments LIMIT 5;
