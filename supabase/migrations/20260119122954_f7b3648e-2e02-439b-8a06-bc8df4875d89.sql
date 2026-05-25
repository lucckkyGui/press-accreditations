-- Fix 1: Restrict accreditation_requests contact data - only show to organizers of approved requests
DROP POLICY IF EXISTS "Organizers can view requests for their events" ON public.accreditation_requests;

CREATE POLICY "Organizers can view requests for their events"
ON public.accreditation_requests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  public.is_event_organizer(auth.uid(), event_id) OR
  public.is_admin(auth.uid())
);

-- Fix 2: Strengthen guests table RLS - ensure only event organizers can access
DROP POLICY IF EXISTS "Event organizers can view guests" ON public.guests;
DROP POLICY IF EXISTS "Users can view their own guest entries" ON public.guests;
DROP POLICY IF EXISTS "Organizers can view event guests" ON public.guests;
DROP POLICY IF EXISTS "Organizers can manage event guests" ON public.guests;

-- Only event organizers and admins can view guests
CREATE POLICY "Organizers can view event guests"
ON public.guests
FOR SELECT
TO authenticated
USING (
  public.is_event_organizer(auth.uid(), event_id) OR
  public.is_admin(auth.uid())
);

-- Only event organizers and admins can insert guests
CREATE POLICY "Organizers can insert event guests"
ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_event_organizer(auth.uid(), event_id) OR
  public.is_admin(auth.uid())
);

-- Only event organizers and admins can update guests
CREATE POLICY "Organizers can update event guests"
ON public.guests
FOR UPDATE
TO authenticated
USING (
  public.is_event_organizer(auth.uid(), event_id) OR
  public.is_admin(auth.uid())
);

-- Only event organizers and admins can delete guests
CREATE POLICY "Organizers can delete event guests"
ON public.guests
FOR DELETE
TO authenticated
USING (
  public.is_event_organizer(auth.uid(), event_id) OR
  public.is_admin(auth.uid())
);