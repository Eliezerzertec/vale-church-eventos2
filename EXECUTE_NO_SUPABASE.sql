-- ================================================================
-- ⚠️ EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- Dashboard > SQL Editor > "New Query" > Cole este texto > RUN
-- ================================================================

-- Passo 1: Remover políticas RLS existentes que estão bloqueando UPDATE
DROP POLICY IF EXISTS "registrations_update_self" ON public.event_registrations;
DROP POLICY IF EXISTS "registrations_update_admin" ON public.event_registrations;
DROP POLICY IF EXISTS "anyone_can_update_registrations" ON public.event_registrations;

-- Passo 2: Criar nova política permissiva para UPDATE (desenvolvimento)
-- ⚠️ Esta política é PERMISSIVA para desenvolvimento apenas!
-- Em produção, use autenticação + função RPC com SECURITY DEFINER

CREATE POLICY "allow_update_registrations_for_payment_confirmation"
ON public.event_registrations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Passo 3: Verificar se a política foi criada
SELECT 
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'event_registrations'
ORDER BY policyname;

-- Sucesso! ✅
-- Agora as inscrições podem ser atualizadas quando o pagamento for confirmado
