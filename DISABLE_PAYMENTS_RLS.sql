-- Desabilitar RLS temporariamente na tabela payments para testes
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Verificar status
SELECT tablename, (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name=tablename AND constraint_type='CHECK') as constraints
FROM pg_tables 
WHERE schemaname='public' AND tablename='payments';
