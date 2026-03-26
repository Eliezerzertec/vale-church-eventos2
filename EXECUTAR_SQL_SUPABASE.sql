-- EXECUTAR NO SUPABASE SQL EDITOR
-- https://supabase.com/dashboard → SQL Editor

-- Adicionar coluna coupon_id na tabela events
ALTER TABLE events ADD COLUMN IF NOT EXISTS coupon_id TEXT NULL;

-- Criar índice para consultas mais rápidas
CREATE INDEX IF NOT EXISTS idx_events_coupon_id ON events(coupon_id);

-- Verificar se foi criado
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'coupon_id';
