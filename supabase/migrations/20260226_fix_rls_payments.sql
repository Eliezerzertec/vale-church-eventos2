-- FIX RLS para tabela payments - permitir acesso público sem login
-- O erro 406 acontece porque RLS está bloqueando queries anônimas

-- Desabilita RLS completamente (para testes)
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Agora qualquer pessoa pode acessar sem autenticação
-- Rode este script no Supabase SQL Editor

-- Verificação:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename='payments';
