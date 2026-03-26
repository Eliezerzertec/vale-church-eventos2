-- ================================================================
-- ⭐ SOLUÇÃO MAIS FÁCIL: Trigger Automática no PostgreSQL
-- Execute no Supabase SQL Editor
-- ================================================================

-- Passo 1: Criar função que confirma inscrição quando pagamento é marcado como "paid"
CREATE OR REPLACE FUNCTION public.confirm_registration_on_payment_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para "paid", confirmar a inscrição correspondente
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE public.event_registrations
    SET status = 'confirmed',
        updated_at = NOW()
    WHERE id = NEW.registration_id;
    
    RAISE NOTICE 'Inscrição % confirmada automaticamente', NEW.registration_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Passo 2: Criar a trigger que dispara a função
DROP TRIGGER IF EXISTS trigger_confirm_registration_on_payment ON public.payments;

CREATE TRIGGER trigger_confirm_registration_on_payment
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.confirm_registration_on_payment_paid();

-- Passo 3: Verificar se foi criada
SELECT * FROM pg_trigger WHERE tgname = 'trigger_confirm_registration_on_payment';

-- ================================================================
-- Pronto! ✅
-- Agora toda vez que um pagamento é marcado como "paid",
-- a inscrição correspondente será automaticamente "confirmed"
-- ================================================================
