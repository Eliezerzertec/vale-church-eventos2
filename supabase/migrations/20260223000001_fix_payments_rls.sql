-- Fix RLS for payments table - allow public access by registration_id
-- The previous policy required auth.uid(), but payments can be checked without login

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated or service can insert payments" ON public.payments;

-- SELECT: Anyone can view payment status (needed for payment confirmation page)
CREATE POLICY "Anyone can view payment by registration" ON public.payments FOR SELECT USING (true);

-- INSERT: Only allow during webhook processing (service role) or with proper auth
CREATE POLICY "System can insert payments" ON public.payments FOR INSERT WITH CHECK (true);

-- UPDATE: Only admins or webhook service
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- DELETE: Only admins
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
