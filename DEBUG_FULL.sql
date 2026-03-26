-- ================================================================
-- DEBUG COMPLETO: Verificar trigger, RLS e dados
-- Execute no Supabase SQL Editor
-- ================================================================

-- 1. Verificar se trigger existe e está ativa
SELECT 
    tgname as trigger_name,
    tgenabled as is_enabled,
    tgtype as trigger_type
FROM pg_trigger
WHERE tgrelid = 'public.payments'::regclass;

-- 2. Ver função da trigger
SELECT 
    p.proname as function_name,
    p.prosrc as function_code
FROM pg_proc p
WHERE p.proname = 'confirm_registration_on_payment_paid';

-- 3. Ver RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename IN ('payments', 'event_registrations');

-- 4. Ver últimos pagamentos com inscrições
SELECT 
    p.id as payment_id,
    p.registration_id,
    p.status as payment_status,
    p.created_at,
    r.id as registration_id,
    r.status as registration_status
FROM public.payments p
LEFT JOIN public.event_registrations r ON p.registration_id = r.id
ORDER BY p.created_at DESC
LIMIT 5;

-- 5. Ver EXATAMENTE qual status está no banco (com quotes)
SELECT 
    DISTINCT status,
    COUNT(*) as total
FROM public.payments
GROUP BY status
ORDER BY status;

-- 6. Tentar fazer UPDATE manualmente e ver se funciona
-- DESCOMENTE PARA TESTAR (e use um ID real do seu último payment)
-- UPDATE public.payments 
-- SET status = 'paid' 
-- WHERE id = 'seu-payment-id-aqui'
-- RETURNING id, status;
