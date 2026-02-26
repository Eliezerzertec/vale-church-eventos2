-- ========================================
-- DIAGNÓSTICO: Verificar Estrutura da Tabela
-- ========================================
-- Execute esta query para ver quais colunas REALMENTE existem em payments

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments'
ORDER BY ordinal_position;

-- Resultado esperado: deve mostrar 10+ colunas incluindo billing_id e payment_method
