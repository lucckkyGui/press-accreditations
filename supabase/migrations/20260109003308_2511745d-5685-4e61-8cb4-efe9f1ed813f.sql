-- Fix overly permissive INSERT policy for notifications
-- Drop the permissive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.user_notifications;

-- Create a more restrictive policy - only organizers can create notifications for users
CREATE POLICY "Organizers can create notifications for event participants"
ON public.user_notifications FOR INSERT
WITH CHECK (
    -- Organizers can create notifications for their events
    event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid())
    OR 
    -- Users can create notifications for themselves (e.g., system triggered)
    user_id = auth.uid()
);