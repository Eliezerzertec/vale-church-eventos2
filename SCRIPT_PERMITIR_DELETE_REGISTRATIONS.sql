-- ✅ Script para permitir DELETE em event_registrations
-- Execute em: Database > SQL Editor no Supabase

-- 1. Desabilitar RLS temporariamente para debug/admin
ALTER TABLE public.event_registrations DISABLE ROW LEVEL SECURITY;

-- 2. OU: Criar política permissiva para DELETE (se RLS está ativo)
CREATE POLICY "allow_delete_registrations" 
ON public.event_registrations
FOR DELETE 
TO authenticated
USING (true);

-- 3. Verificar se RLS está desabilitar
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'event_registrations';
-- Resultado esperado: f (falso = RLS desabilitado)

-- 4. Se tiver erro de constraint (payment linkado):
-- Deletar payments antes de deletar registration:
-- DELETE FROM public.payments WHERE registration_id = 'abc123';
-- DELETE FROM public.event_registrations WHERE id = 'abc123';
