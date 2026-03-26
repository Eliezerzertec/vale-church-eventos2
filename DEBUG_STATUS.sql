-- ================================================================
-- DEBUG: Ver exatamente o que está acontecendo
-- Execute no Supabase SQL Editor
-- ================================================================

-- 1. Ver últimos pagamentos vs inscrições
SELECT 
    p.id as payment_id,
    p.registration_id,
    p.status as payment_status,
    p.created_at,
    r.id as registration_id,
    r.status as registration_status,
    r.created_at as registration_created
FROM public.payments p
LEFT JOIN public.event_registrations r ON p.registration_id = r.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 2. Ver valores exatos dos status (para ver se é case-sensitive)
SELECT DISTINCT status FROM public.payments ORDER BY status;
SELECT DISTINCT status FROM public.event_registrations ORDER BY status;

-- 3. Ver se a trigger existe e está ativa
SELECT 
    tgname,
    tgenabled,
    tgtype,
    relname
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE tgname LIKE '%confirm%';

-- 4. Ver a função da trigger
SELECT pg_get_functiondef('public.confirm_registration_on_payment_paid'::regprocedure);

-- 5. Ver RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename IN ('payments', 'event_registrations')
ORDER BY tablename, policyname;
