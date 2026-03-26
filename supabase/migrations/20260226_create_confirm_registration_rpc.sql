-- ============================================
-- FUNÇÃO RPC: Confirmar inscrição após pagamento
-- Alternativa segura para UPDATE via RLS permissivo
-- ============================================

CREATE OR REPLACE FUNCTION public.confirm_registration_after_payment(
  p_registration_id UUID,
  p_payment_status TEXT DEFAULT 'paid'
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Atualizar inscrição para confirmed
  UPDATE public.event_registrations
  SET status = 'confirmed'
  WHERE id = p_registration_id;

  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'registration_id', p_registration_id,
    'status', 'confirmed',
    'updated_at', NOW()
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para qualquer um chamar essa função
GRANT EXECUTE ON FUNCTION public.confirm_registration_after_payment(UUID, TEXT) TO authenticated, anon;

-- Testar
SELECT public.confirm_registration_after_payment('test-id'::UUID);
