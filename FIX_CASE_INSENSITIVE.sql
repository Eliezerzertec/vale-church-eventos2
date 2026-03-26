-- ================================================================
-- FIX: Trigger case-insensitive + Força UPDATE direto
-- Execute no Supabase SQL Editor
-- ================================================================

-- Passo 1: Remover trigger antiga que está esperando minúsculo
DROP TRIGGER IF EXISTS trigger_confirm_registration_on_payment ON public.payments;

-- Passo 2: Recriar função com comparação case-insensitive
CREATE OR REPLACE FUNCTION public.confirm_registration_on_payment_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se status mudou para "paid" (case-insensitive)
  IF LOWER(NEW.status) = 'paid' AND LOWER(OLD.status) != 'paid' THEN
    UPDATE public.event_registrations
    SET status = 'confirmed',
        updated_at = NOW()
    WHERE id = NEW.registration_id;
    
    RAISE LOG 'Inscrição % confirmada automaticamente por trigger (status: %)', 
              NEW.registration_id, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Passo 3: Recriar trigger
CREATE TRIGGER trigger_confirm_registration_on_payment
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.confirm_registration_on_payment_paid();

-- Passo 4: Garantir que RLS está bem configurado (super permissivo)
DROP POLICY IF EXISTS "payments_allow_all" ON public.payments;
DROP POLICY IF EXISTS "registrations_allow_all" ON public.event_registrations;

CREATE POLICY "payments_all"
ON public.payments
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "registrations_all"
ON public.event_registrations
FOR ALL
USING (true)
WITH CHECK (true);

-- Passo 5: Forçar confirmação de inscrições já "pendentes" com pagamento "paid/PAID"
-- Isso corrige casos que já falharam antes
UPDATE public.event_registrations r
SET status = 'confirmed',
    updated_at = NOW()
WHERE status = 'pending'
  AND id IN (
    SELECT registration_id 
    FROM public.payments 
    WHERE LOWER(status) = 'paid'
  );

-- Passo 6: Verificar resultado
SELECT 
    COUNT(*) as pagamentos_com_paid,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as inscricoes_confirmadas
FROM (
    SELECT p.id, p.status, r.status as reg_status
    FROM public.payments p
    LEFT JOIN public.event_registrations r ON p.registration_id = r.id
) as data;

-- ================================================================
-- ✅ Pronto!
-- - Trigger agora é case-insensitive (funciona com PAID ou paid)
-- - Pagamentos já feitos foram corrigidos
-- - Próximos pagamentos funcionarão automaticamente
-- ================================================================
