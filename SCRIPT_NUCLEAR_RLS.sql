-- ========================================
-- SCRIPT NUCLEAR: Remove TUDO e Reconfigura
-- Use isto se os outros não funcionarem
-- ========================================

BEGIN;

-- DROP de todas as políticas existentes
DROP POLICY IF EXISTS "Permitir inserção anônima de inscrições" ON event_registrations;
DROP POLICY IF EXISTS "Permitir leitura de inscrições" ON event_registrations;
DROP POLICY IF EXISTS "Permitir atualização de inscrições" ON event_registrations;
DROP POLICY IF EXISTS "Permitir deleção de inscrições" ON event_registrations;
DROP POLICY IF EXISTS "allow_anonymous_signup" ON event_registrations;
DROP POLICY IF EXISTS "enable_insert_for_all" ON event_registrations;
DROP POLICY IF EXISTS "enable_select_for_all" ON event_registrations;
DROP POLICY IF EXISTS "enable_update_for_all" ON event_registrations;
DROP POLICY IF EXISTS "enable_delete_for_all" ON event_registrations;

-- DROP de políticas de events
DROP POLICY IF EXISTS "Permitir leitura de eventos" ON events;
DROP POLICY IF EXISTS "Permitir criar/atualizar eventos" ON events;
DROP POLICY IF EXISTS "Permitir atualizar eventos" ON events;
DROP POLICY IF EXISTS "enable_read_all" ON events;
DROP POLICY IF EXISTS "enable_insert_all" ON events;

-- DROP de políticas de payments
DROP POLICY IF EXISTS "Permitir inserção de pagamentos" ON payments;
DROP POLICY IF EXISTS "Permitir leitura de pagamentos" ON payments;
DROP POLICY IF EXISTS "Permitir atualizar pagamentos" ON payments;
DROP POLICY IF EXISTS "Permitir deletar pagamentos" ON payments;

-- Agora DESABILITA RLS completamente
ALTER TABLE IF EXISTS event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;

COMMIT;

-- Verificação
SELECT 'event_registrations' as table_name, 
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE table_name = 'event_registrations' 
   AND constraint_type = 'CHECK') as policies_count;
