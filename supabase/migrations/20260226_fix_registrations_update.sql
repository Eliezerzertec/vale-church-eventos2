-- ============================================
-- Corrigir RLS para permitir UPDATE em event_registrations
-- Problema: inscrições são anônimas (user_id = NULL) e RLS está bloqueando
-- Solução: Permitir UPDATE em registros com user_id NULL
-- ============================================

-- 1. REMOVER políticas antigas que estão bloqueando
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Anyone can register for events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can update own registration status" ON public.event_registrations;
DROP POLICY IF EXISTS "Anonymous registrations can be updated" ON public.event_registrations;

-- 2. Recriar políticas de forma simples
-- SELECT: Qualquer um pode ver
CREATE POLICY "Anyone can view registrations" ON public.event_registrations 
FOR SELECT USING (true);

-- INSERT: Qualquer um pode criar inscrição
CREATE POLICY "Anyone can register for events" ON public.event_registrations 
FOR INSERT WITH CHECK (true);

-- UPDATE: Qualquer um pode atualizar (especialmente anônimos com user_id NULL)
CREATE POLICY "Anyone can update registrations" ON public.event_registrations 
FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE: Apenas admins podem deletar
CREATE POLICY "Admins can delete registrations" ON public.event_registrations 
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 3. Verificar se funcionou
SELECT 
  'event_registrations' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous
FROM public.event_registrations;

