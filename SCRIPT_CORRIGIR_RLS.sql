-- ========================================
-- SCRIPT DE CORREÇÃO: RLS Row Level Security
-- Projeto: Vale Church Manager
-- Data: 20/02/2026
-- ========================================

-- Passo 1: Habilitar RLS na tabela event_registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Passo 2: Permitir INSERT (Inserção de inscrições)
CREATE POLICY "Permitir inserção anônima de inscrições" ON event_registrations
FOR INSERT
WITH CHECK (true);

-- Passo 3: Permitir SELECT (Leitura de inscrições)
CREATE POLICY "Permitir leitura de inscrições" ON event_registrations
FOR SELECT
USING (true);

-- Passo 4: Permitir UPDATE (Atualização de inscrições)
CREATE POLICY "Permitir atualização de inscrições" ON event_registrations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Passo 5: Permitir DELETE (Deleção de inscrições)
CREATE POLICY "Permitir deleção de inscrições" ON event_registrations
FOR DELETE
USING (true);

-- ========================================
-- Políticas para tabela: events
-- ========================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de eventos" ON events
FOR SELECT
USING (true);

CREATE POLICY "Permitir criar/atualizar eventos" ON events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualizar eventos" ON events
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ========================================
-- Políticas para tabela: payments
-- ========================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserção de pagamentos" ON payments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir leitura de pagamentos" ON payments
FOR SELECT
USING (true);

CREATE POLICY "Permitir atualizar pagamentos" ON payments
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir deletar pagamentos" ON payments
FOR DELETE
USING (true);

-- ========================================
-- Políticas para tabela: user_roles (se tiver)
-- ========================================

ALTER TABLE IF EXISTS user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Permitir leitura de roles" ON user_roles
FOR SELECT
USING (true);

-- ========================================
-- FIM DO SCRIPT
-- Todas as políticas foram criadas com sucesso!
-- ========================================
