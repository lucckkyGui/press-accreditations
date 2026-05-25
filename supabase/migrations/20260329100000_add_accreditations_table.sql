-- ============================================================
-- Compatibility patch before performance indexes.
-- Later performance migration expects public.accreditations.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.accreditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  accreditation_request_id uuid REFERENCES public.accreditation_requests(id) ON DELETE SET NULL,
  type text,
  status text NOT NULL DEFAULT 'pending',
  issued_at timestamptz,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accreditations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own accreditations" ON public.accreditations;
CREATE POLICY "Users can view own accreditations"
ON public.accreditations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can manage accreditations for their events" ON public.accreditations;
CREATE POLICY "Organizers can manage accreditations for their events"
ON public.accreditations
FOR ALL
TO authenticated
USING (
  public.is_event_organizer(auth.uid(), event_id)
  OR public.is_admin(auth.uid())
)
WITH CHECK (
  public.is_event_organizer(auth.uid(), event_id)
  OR public.is_admin(auth.uid())
);
