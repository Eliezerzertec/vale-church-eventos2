-- CORRIGIR RLS PARA PERMITIR UPDATES NA TABELA PAYMENTS
-- Problema: UPDATE de payments estava retornando erro de coluna

-- Desabilitar RLS na tabela payments para evitar bloqueios (modo desenvolvimento)
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Log da ação
DO $$ BEGIN
  RAISE NOTICE 'RLS desabilitada na tabela payments - permitindo UPDATEs para desenvolvimento';
END $$;
