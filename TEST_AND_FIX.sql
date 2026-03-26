-- ================================================================
-- TESTE E FIX: Confirmar inscrições manualmente após pagamento
-- Execute no Supabase SQL Editor
-- ================================================================

-- Passo 1: Ver últimos pagamentos e suas inscrições
SELECT 
    p.id as payment_id,
    p.status as payment_status,
    p.registration_id,
    r.status as registration_status,
    r.full_name,
    p.created_at
FROM public.payments p
LEFT JOIN public.event_registrations r ON p.registration_id = r.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Passo 2: Ver quais inscrições têm pagamento "PAID" mas status "pending"
SELECT 
    r.id as registration_id,
    r.full_name,
    r.status as registration_status,
    p.id as payment_id,
    p.status as payment_status
FROM public.event_registrations r
INNER JOIN public.payments p ON r.id = p.registration_id
WHERE r.status = 'pending' 
  AND (p.status = 'paid' OR p.status = 'PAID' OR p.status ILIKE '%paid%')
ORDER BY r.created_at DESC;

-- Passo 3: CORRIGIR MANUALMENTE - Atualizar TODAS as inscrições que têm pagamento confirmado
UPDATE public.event_registrations r
SET status = 'confirmed'
WHERE r.status = 'pending'
  AND r.id IN (
    SELECT p.registration_id
    FROM public.payments p
    WHERE p.status = 'paid' 
       OR p.status = 'PAID'
       OR p.status ILIKE '%paid%'
  );

-- Passo 4: Ver resultado da correção
SELECT 
    '✅ Inscrições agora confirmadas' as resultado,
    COUNT(*) as total
FROM public.event_registrations
WHERE status = 'confirmed'

UNION ALL

SELECT 
    '⏳ Inscrições ainda pendentes',
    COUNT(*)
FROM public.event_registrations
WHERE status = 'pending';

-- Passo 5: Verificar trigger
SELECT 
    tgname as trigger_name,
    CASE WHEN tgenabled = 'O' THEN 'ATIVA' ELSE 'INATIVA' END as status
FROM pg_trigger
WHERE tgname LIKE '%confirm%';

-- ================================================================
-- ✅ Depois execute SOLUTION_FINAL.sql para recriar trigger
-- ================================================================
