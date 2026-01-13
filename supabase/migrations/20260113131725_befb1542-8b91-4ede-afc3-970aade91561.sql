-- Fix invitation_templates - overly permissive policies
DROP POLICY IF EXISTS "Allow read access to all invitation templates" ON public.invitation_templates;
DROP POLICY IF EXISTS "Anyone can delete invitation templates" ON public.invitation_templates;
DROP POLICY IF EXISTS "Anyone can update invitation templates" ON public.invitation_templates;
DROP POLICY IF EXISTS "Only authenticated users can create invitation templates" ON public.invitation_templates;

-- Create proper policies for invitation_templates - only authenticated users can manage
CREATE POLICY "Authenticated users can view invitation templates"
ON public.invitation_templates
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create invitation templates"
ON public.invitation_templates
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invitation templates"
ON public.invitation_templates
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete invitation templates"
ON public.invitation_templates
FOR DELETE
TO authenticated
USING (true);

-- Fix guests policies - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Only event organizers can view guests" ON public.guests;
DROP POLICY IF EXISTS "Only event organizers can create guests" ON public.guests;
DROP POLICY IF EXISTS "Only event organizers can update guests" ON public.guests;
DROP POLICY IF EXISTS "Only event organizers can delete guests" ON public.guests;

CREATE POLICY "Event organizers can view guests"
ON public.guests
FOR SELECT
TO authenticated
USING (auth.uid() IN (
  SELECT events.organizer_id
  FROM events
  WHERE events.id = guests.event_id
));

CREATE POLICY "Event organizers can create guests"
ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
  SELECT events.organizer_id
  FROM events
  WHERE events.id = event_id
));

CREATE POLICY "Event organizers can update guests"
ON public.guests
FOR UPDATE
TO authenticated
USING (auth.uid() IN (
  SELECT events.organizer_id
  FROM events
  WHERE events.id = guests.event_id
));

CREATE POLICY "Event organizers can delete guests"
ON public.guests
FOR DELETE
TO authenticated
USING (auth.uid() IN (
  SELECT events.organizer_id
  FROM events
  WHERE events.id = guests.event_id
));

-- Fix accreditation_requests policies - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own accreditation requests" ON public.accreditation_requests;
DROP POLICY IF EXISTS "Users can create accreditation requests" ON public.accreditation_requests;
DROP POLICY IF EXISTS "Event organizers can view accreditation requests for their even" ON public.accreditation_requests;
DROP POLICY IF EXISTS "Event organizers can update accreditation requests" ON public.accreditation_requests;

CREATE POLICY "Users can view own accreditation requests"
ON public.accreditation_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view event accreditation requests"
ON public.accreditation_requests
FOR SELECT
TO authenticated
USING (event_id IN (
  SELECT events.id
  FROM events
  WHERE events.organizer_id = auth.uid()
));

CREATE POLICY "Authenticated users can create accreditation requests"
ON public.accreditation_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event organizers can update accreditation requests"
ON public.accreditation_requests
FOR UPDATE
TO authenticated
USING (event_id IN (
  SELECT events.id
  FROM events
  WHERE events.organizer_id = auth.uid()
));