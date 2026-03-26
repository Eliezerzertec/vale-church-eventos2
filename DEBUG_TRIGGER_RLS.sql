-- ================================================================
-- DEBUG: Verificar triggers e RLS policies
-- Execute no Supabase SQL Editor
-- ================================================================

-- 1. Verificar se a trigger foi criada
SELECT 
    tgname AS trigger_name,
    relname AS table_name,
    pga_proc_oid::regprocedure AS function_name
FROM pg_trigger
JOIN pg_class ON (pg_trigger.tgrelid = pg_class.oid)
WHERE tgname LIKE '%confirm%' OR tgname LIKE '%payment%'
ORDER BY relname, tgname;

-- 2. Verificar todos os triggers na tabela payments
SELECT 
    tgname,
    tgtype,
    tgenabled
FROM pg_trigger
WHERE tgrelid = 'public.payments'::regclass
ORDER BY tgname;

-- 3. Verificar RLS policies na tabela payments
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'payments'
ORDER BY policyname;

-- 4. Verificar RLS policies na tabela event_registrations
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'event_registrations'
ORDER BY policyname;

-- 5. Verificar RLS ativado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND (tablename = 'payments' OR tablename = 'event_registrations')
ORDER BY tablename;

-- 6. Ver últimos pagamentos
SELECT 
    id,
    registration_id,
    event_id,
    billing_id,
    status,
    created_at,
    updated_at
FROM public.payments
ORDER BY created_at DESC
LIMIT 5;

-- 7. Ver últimas inscrições
SELECT 
    id,
    event_id,
    status,
    created_at,
    updated_at
FROM public.event_registrations
ORDER BY created_at DESC
LIMIT 5;

-- ================================================================
-- Analise os resultados:
-- 1. Se trigger_confirm_registration_on_payment existe✓
-- 2. Se payments tem RLS ativado
-- 3. Se há policies restrictivas em payments
-- 4. Se event_registrations tem UPDATE policy permissiva
-- ================================================================
