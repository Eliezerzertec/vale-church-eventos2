-- ============================================
-- SETUP COMPLETO DA TABELA webhook_logs
-- ============================================

-- 1. Criar tabela webhook_logs (se não existir)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  event VARCHAR(50),
  billing_id VARCHAR(255) NOT NULL,
  request_body JSONB,
  response_status VARCHAR(10) DEFAULT '200',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_billing ON public.webhook_logs(billing_id);
CREATE INDEX IF NOT EXISTS idx_webhook_created ON public.webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_event ON public.webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_webhook_status ON public.webhook_logs(response_status);

-- 3. DESABILITAR RLS para Realtime funcionar
ALTER TABLE public.webhook_logs DISABLE ROW LEVEL SECURITY;

-- 4. Garantir que a tabela está em replication mode para Realtime
ALTER TABLE public.webhook_logs REPLICA IDENTITY FULL;

-- ============================================
-- Verificar se tudo foi criado
-- ============================================
SELECT 
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'webhook_logs';

-- Contar registros
SELECT COUNT(*) as total_webhooks FROM public.webhook_logs;

-- Ver últimos 5 webhooks
SELECT 
  id,
  event,
  billing_id,
  response_status,
  created_at
FROM public.webhook_logs
ORDER BY created_at DESC
LIMIT 5;
