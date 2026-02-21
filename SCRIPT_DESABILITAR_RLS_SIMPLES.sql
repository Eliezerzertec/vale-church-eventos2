-- ========================================
-- SCRIPT AGRESSIVO: Limpar e Reconfigar RLS
-- Projeto: Vale Church Manager
-- Data: 20/02/2026
-- ========================================

-- ========================================
-- PASSO 1: DESABILITAR RLS (Mais Simples para Dev)
-- ========================================

ALTER TABLE IF EXISTS event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;

-- ========================================
-- RESULTADO: Tabelas sem restrição RLS
-- Agora qualquer pessoa pode:
-- - INSERT (criar)
-- - SELECT (ler)
-- - UPDATE (atualizar)
-- - DELETE (deletar)
-- ========================================

-- Se quiser verificar que funcionou:
-- SELECT tablename FROM pg_tables WHERE tablename = 'event_registrations';
