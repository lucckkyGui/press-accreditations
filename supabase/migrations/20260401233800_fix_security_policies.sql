-- 1. Fix email_queue: Add anon block policy
CREATE POLICY "Block unauthenticated access to email_queue"
ON public.email_queue FOR SELECT TO anon USING (false);

-- 2. Fix invitation_templates: Remove overly permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own invitation templates" ON public.invitation_templates;
CREATE POLICY "Users can update their own invitation templates"
ON public.invitation_templates FOR UPDATE TO authenticated
USING (auth.uid() = created_by);
CREATE POLICY "Admins can update any invitation template"
ON public.invitation_templates FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

-- 3. Fix accreditations: Change from public to authenticated role
DROP POLICY IF EXISTS "Event organizers can create accreditations" ON public.accreditations;
DROP POLICY IF EXISTS "Event organizers can update accreditations" ON public.accreditations;
DROP POLICY IF EXISTS "Event organizers can view accreditations for their events" ON public.accreditations;
DROP POLICY IF EXISTS "Users can view their own accreditations" ON public.accreditations;

CREATE POLICY "Block unauthenticated access to accreditations"
ON public.accreditations FOR SELECT TO anon USING (false);
CREATE POLICY "Event organizers can create accreditations"
ON public.accreditations FOR INSERT TO authenticated
WITH CHECK (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));
CREATE POLICY "Event organizers can update accreditations"
ON public.accreditations FOR UPDATE TO authenticated
USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));
CREATE POLICY "Event organizers can view accreditations for their events"
ON public.accreditations FOR SELECT TO authenticated
USING (event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid()));
CREATE POLICY "Users can view their own accreditations"
ON public.accreditations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 4. Fix access_logs, wristbands, zone_presence: Add anon block + change to authenticated
-- access_logs
DROP POLICY IF EXISTS "Organizers can manage access logs for their events" ON public.access_logs;
CREATE POLICY "Block unauthenticated access to access_logs"
ON public.access_logs FOR SELECT TO anon USING (false);
CREATE POLICY "Organizers can manage access logs for their events"
ON public.access_logs FOR ALL TO authenticated
USING (is_event_organizer(auth.uid(), event_id) OR is_admin(auth.uid()));

-- wristbands
DROP POLICY IF EXISTS "Organizers can manage wristbands for their events" ON public.wristbands;
CREATE POLICY "Block unauthenticated access to wristbands"
ON public.wristbands FOR SELECT TO anon USING (false);
CREATE POLICY "Organizers can manage wristbands for their events"
ON public.wristbands FOR ALL TO authenticated
USING (is_event_organizer(auth.uid(), event_id) OR is_admin(auth.uid()));

-- zone_presence
DROP POLICY IF EXISTS "Organizers can manage zone presence for their events" ON public.zone_presence;
CREATE POLICY "Block unauthenticated access to zone_presence"
ON public.zone_presence FOR SELECT TO anon USING (false);
CREATE POLICY "Organizers can manage zone presence for their events"
ON public.zone_presence FOR ALL TO authenticated
USING (is_event_organizer(auth.uid(), event_id) OR is_admin(auth.uid()));
