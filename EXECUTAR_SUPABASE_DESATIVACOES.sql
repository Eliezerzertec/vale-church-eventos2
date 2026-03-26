-- EXECUTAR NO SUPABASE (SQL Editor)
-- Criar tabela para ratrear cupons desativados localmente

CREATE TABLE IF NOT EXISTS coupon_deactivations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id TEXT NOT NULL UNIQUE,
  coupon_code TEXT NOT NULL,
  deactivated_at TIMESTAMP DEFAULT NOW(),
  reason TEXT,
  deactivated_by TEXT
);

-- Index para buscar rápido
CREATE INDEX IF NOT EXISTS idx_coupon_deactivations_coupon_id 
ON coupon_deactivations(coupon_id);
