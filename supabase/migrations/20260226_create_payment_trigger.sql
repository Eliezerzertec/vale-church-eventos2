-- Trigger para confirmar automaticamente a inscrição quando pagamento é marcado como "paid"
-- Quando um registro em 'payments' é atualizado para status = 'paid'
-- Marca a inscrição correspondente como 'confirmed'

DROP TRIGGER IF EXISTS trigger_confirm_registration_on_payment ON public.payments;
DROP FUNCTION IF EXISTS confirm_registration_on_payment_paid();

CREATE OR REPLACE FUNCTION confirm_registration_on_payment_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para "paid"
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Atualizar inscrição para 'confirmed'
    UPDATE public.event_registrations
    SET status = 'confirmed'
    WHERE id = NEW.registration_id AND status = 'pending';
    
    RAISE NOTICE 'Registration % marked as confirmed', NEW.registration_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_confirm_registration_on_payment
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION confirm_registration_on_payment_paid();

-- Log para confirmar que trigger foi criada
SELECT 'Trigger created successfully' as status;
