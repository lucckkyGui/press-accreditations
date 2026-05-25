-- ============================================================
-- API key RLS policies required by the settings UI and public API.
-- ============================================================

DROP POLICY IF EXISTS "Users can view own api keys" ON public.api_keys;
CREATE POLICY "Users can view own api keys"
ON public.api_keys
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create own api keys" ON public.api_keys;
CREATE POLICY "Users can create own api keys"
ON public.api_keys
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    event_id IS NULL
    OR public.is_event_organizer(auth.uid(), event_id)
    OR public.is_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete own api keys" ON public.api_keys;
CREATE POLICY "Users can delete own api keys"
ON public.api_keys
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own api keys" ON public.api_keys;
CREATE POLICY "Users can update own api keys"
ON public.api_keys
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (
  (user_id = auth.uid() OR public.is_admin(auth.uid()))
  AND (
    event_id IS NULL
    OR public.is_event_organizer(auth.uid(), event_id)
    OR public.is_admin(auth.uid())
  )
);
