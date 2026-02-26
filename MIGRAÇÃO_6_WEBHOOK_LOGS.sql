-- ========================================
-- MIGRAÇÃO 6: Criar tabela de logs de webhook
-- ========================================

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  billing_id TEXT NOT NULL,
  status TEXT,
  request_body JSONB,
  response_status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index para buscar rápido por billing_id
CREATE INDEX IF NOT EXISTS idx_webhook_logs_billing_id ON public.webhook_logs(billing_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- RLS Policy
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Webhook logs - SELECT públic" 
ON public.webhook_logs FOR SELECT 
USING (true);

CREATE POLICY "Webhook logs - INSERT sistema" 
ON public.webhook_logs FOR INSERT 
WITH CHECK (true);
