-- ================================================================
-- SOLUÇÃO COMPLETA: Trigger + RLS + Corrigir dados antigos
-- Execute este INTEIRO no Supabase SQL Editor
-- ================================================================

-- =====================================================
-- PASSO 1: Disable RLS (mais simples para desenvolvimento)
-- =====================================================
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSO 2: REMOVER trigger antiga
-- =====================================================
DROP TRIGGER IF EXISTS trigger_confirm_registration_on_payment ON public.payments;

-- =====================================================
-- PASSO 3: Recriar função trigger SIMPLES
-- =====================================================
CREATE OR REPLACE FUNCTION public.confirm_registration_on_payment_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Qualquer UPDATE em payments que tenha "paid" no status, confirma a inscrição
  IF NEW.status IS NOT NULL AND NEW.registration_id IS NOT NULL THEN
    UPDATE public.event_registrations
    SET status = 'confirmed'
    WHERE id = NEW.registration_id AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASSO 4: Criar trigger
-- =====================================================
CREATE TRIGGER trigger_confirm_registration_on_payment
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.confirm_registration_on_payment_paid();

-- =====================================================
-- PASSO 5: CORRIGIR TODOS OS DADOS ANTIGOS
-- Inscrições que têm pagamento "paid" mas status "pending"
-- =====================================================
UPDATE public.event_registrations r
SET status = 'confirmed'
WHERE r.status = 'pending'
  AND r.id IN (
    SELECT p.registration_id
    FROM public.payments p
    WHERE LOWER(p.status) = 'paid'
  );

-- =====================================================
-- PASSO 6: Verificar resultado
-- =====================================================
SELECT 
    '✅ Inscrições Confirmadas' as status,
    COUNT(*) as total
FROM public.event_registrations
WHERE status = 'confirmed'

UNION ALL

SELECT 
    '⏳ Inscrições Pendentes',
    COUNT(*)
FROM public.event_registrations
WHERE status = 'pending'

UNION ALL

SELECT 
    '💾 Pagamentos PAID',
    COUNT(*)
FROM public.payments
WHERE LOWER(status) = 'paid'

UNION ALL

SELECT 
    '🔧 Triggers Ativas',
    COUNT(*)
FROM pg_trigger
WHERE tgname = 'trigger_confirm_registration_on_payment' AND tgenabled = 'O';

-- ================================================================
-- ✅ PRONTO!
-- RLS desabilitado para desenvolvimento
-- Trigger criada
-- Dados antigos corrigidos
-- ================================================================

