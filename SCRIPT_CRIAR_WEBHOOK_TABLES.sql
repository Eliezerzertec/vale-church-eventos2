-- ✅ Fase 3: Criar tabelas para idempotência + rastreamento de webhooks
-- Execute no Supabase SQL Editor

-- Tabela principal de eventos de webhook (rastrear cada webhook processado)
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,                        -- webhook.id (log_12345abcdef)
  event TEXT NOT NULL,                        -- "billing.paid", "withdraw.done", etc
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'processed',            -- 'processed', 'failed', 'skipped'
  error_message TEXT,
  payload JSONB                               -- Salvar payload completo para debug
);

-- Índice para buscar eventos recentes
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_time 
  ON webhook_events(event, processed_at DESC);

-- Índice para buscar por ID
CREATE INDEX IF NOT EXISTS idx_webhook_events_id 
  ON webhook_events(id);

-- Índice para buscar por status
CREATE INDEX IF NOT EXISTS idx_webhook_events_status
  ON webhook_events(status);

-- Tabela para mapear webhook_id → billing_id (facilita buscas)
CREATE TABLE IF NOT EXISTS webhook_billing_map (
  webhook_id TEXT PRIMARY KEY,                -- webhook.id
  billing_id TEXT,                            -- payment billing id
  mapped_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (webhook_id) REFERENCES webhook_events(id) ON DELETE CASCADE
);

-- Índice para buscar pelo billing_id
CREATE INDEX IF NOT EXISTS idx_webhook_billing_map_billing_id 
  ON webhook_billing_map(billing_id);

-- Índice para buscar pelo webhook_id
CREATE INDEX IF NOT EXISTS idx_webhook_billing_map_webhook_id 
  ON webhook_billing_map(webhook_id);

-- ✅ Adicionar RLS (Row Level Security) se necessário
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_billing_map ENABLE ROW LEVEL SECURITY;

-- Política para read (only service role)
DROP POLICY IF EXISTS "webhook_events_service_read" ON webhook_events;
CREATE POLICY "webhook_events_service_read" ON webhook_events
  FOR SELECT USING (auth.uid() IS NULL);  -- Service role only

DROP POLICY IF EXISTS "webhook_events_service_write" ON webhook_events;
CREATE POLICY "webhook_events_service_write" ON webhook_events
  FOR INSERT WITH CHECK (auth.uid() IS NULL);  -- Service role only

DROP POLICY IF EXISTS "webhook_billing_map_service_read" ON webhook_billing_map;
CREATE POLICY "webhook_billing_map_service_read" ON webhook_billing_map
  FOR SELECT USING (auth.uid() IS NULL);  -- Service role only

DROP POLICY IF EXISTS "webhook_billing_map_service_write" ON webhook_billing_map;
CREATE POLICY "webhook_billing_map_service_write" ON webhook_billing_map
  FOR INSERT WITH CHECK (auth.uid() IS NULL);  -- Service role only

-- ✅ Verificação
SELECT 'Tabelas criadas com sucesso' as status;
SELECT COUNT(*) as webhook_events_count FROM webhook_events;
SELECT COUNT(*) as webhook_billing_map_count FROM webhook_billing_map;
