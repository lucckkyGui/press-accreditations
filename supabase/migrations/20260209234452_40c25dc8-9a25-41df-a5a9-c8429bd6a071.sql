
-- Block unauthenticated access to guests table
CREATE POLICY "Block unauthenticated access to guests"
ON public.guests
FOR SELECT
USING (false);
