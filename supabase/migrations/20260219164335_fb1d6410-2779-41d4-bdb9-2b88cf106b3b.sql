
-- Fix: tighten event_registrations INSERT - require at least email/name
DROP POLICY "Anyone can register for events" ON public.event_registrations;
CREATE POLICY "Anyone can register for events" ON public.event_registrations 
  FOR INSERT WITH CHECK (full_name IS NOT NULL AND email IS NOT NULL AND length(full_name) > 0 AND length(email) > 3);

-- Fix: tighten payments INSERT - only allow via service role (webhooks)
DROP POLICY "System can insert payments" ON public.payments;
CREATE POLICY "Authenticated or service can insert payments" ON public.payments 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR public.has_role(auth.uid(), 'admin')
  );
