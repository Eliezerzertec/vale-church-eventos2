-- Script para confirmar todos os pagamentos pendentes (marcar como "paid")
-- E confirmar automaticamente as inscrições correspondentes

-- 1. Atualizar todos os pagamentos com status "pending" para "paid"
UPDATE public.payments
SET 
  status = 'paid',
  paid_at = now()
WHERE status = 'pending';

-- 2. Confirmar todas as inscrições que têm pagamentos agora marcados como "paid"
UPDATE public.event_registrations
SET status = 'confirmed'
WHERE 
  status = 'pending'
  AND id IN (
    SELECT DISTINCT registration_id 
    FROM public.payments 
    WHERE status = 'paid'
  );

-- 3. Log do resultado
SELECT 
  'Todos os pagamentos confirmados' as resultado,
  COUNT(*) as total_pagamentos_confirmados
FROM public.payments
WHERE status = 'paid';

SELECT 
  'Todas as inscrições confirmadas' as resultado,
  COUNT(*) as total_inscricoes_confirmadas
FROM public.event_registrations
WHERE status = 'confirmed';
