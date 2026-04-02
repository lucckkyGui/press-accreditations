import postgres from "npm:postgres@3.4.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POLICY_SQL = `
DROP POLICY IF EXISTS "Authenticated users can view accreditation types" ON public.accreditation_types;
DROP POLICY IF EXISTS "Event organizers and participants can view accreditation types" ON public.accreditation_types;
DROP POLICY IF EXISTS "Event organizers can create accreditation types" ON public.accreditation_types;
DROP POLICY IF EXISTS "Event organizers can update accreditation types" ON public.accreditation_types;
DROP POLICY IF EXISTS "Event organizers can delete accreditation types" ON public.accreditation_types;

CREATE POLICY "Event organizers and participants can view accreditation types"
ON public.accreditation_types
FOR SELECT TO authenticated
USING (
  public.is_event_organizer(auth.uid(), event_id)
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.accreditation_requests
    WHERE accreditation_requests.event_id = accreditation_types.event_id
      AND accreditation_requests.user_id = auth.uid()
  )
);

CREATE POLICY "Event organizers can create accreditation types"
ON public.accreditation_types
FOR INSERT TO authenticated
WITH CHECK (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

CREATE POLICY "Event organizers can update accreditation types"
ON public.accreditation_types
FOR UPDATE TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

CREATE POLICY "Event organizers can delete accreditation types"
ON public.accreditation_types
FOR DELETE TO authenticated
USING (public.is_event_organizer(auth.uid(), event_id) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own invitation templates" ON public.invitation_templates;
DROP POLICY IF EXISTS "Admins can update any invitation template" ON public.invitation_templates;

CREATE POLICY "Users can update their own invitation templates"
ON public.invitation_templates
FOR UPDATE TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update any invitation template"
ON public.invitation_templates
FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Block unauthenticated access to email_queue" ON public.email_queue;
DROP POLICY IF EXISTS "Organizers can manage email queue for their events" ON public.email_queue;

CREATE POLICY "Block unauthenticated access to email_queue"
ON public.email_queue
AS RESTRICTIVE
FOR SELECT TO anon
USING (false);

CREATE POLICY "Organizers can manage email queue for their events"
ON public.email_queue
FOR ALL TO authenticated
USING (
  invitation_id IN (
    SELECT inv.id
    FROM public.invitations inv
    JOIN public.events e ON e.id = inv.event_id
    WHERE e.organizer_id = auth.uid()
  )
)
WITH CHECK (
  invitation_id IN (
    SELECT inv.id
    FROM public.invitations inv
    JOIN public.events e ON e.id = inv.event_id
    WHERE e.organizer_id = auth.uid()
  )
);
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!dbUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing config" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Only allow calls with the service role key
  if (authHeader !== serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const sql = postgres(dbUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 5,
    connect_timeout: 10,
  });

  try {
    await sql.unsafe(POLICY_SQL);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply security fixes";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } finally {
    await sql.end({ timeout: 5 });
  }
});