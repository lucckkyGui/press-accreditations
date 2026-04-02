import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  const authHeader = req.headers.get("Authorization");

  if (!supabaseUrl || !anonKey || !dbUrl || !authHeader) {
    return json({ error: "Missing required configuration" }, 500);
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin", { _user_id: user.id });
  if (roleError || !isAdmin) {
    return json({ error: "Forbidden" }, 403);
  }

  const sql = postgres(dbUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 5,
    connect_timeout: 10,
  });

  try {
    await sql.unsafe(POLICY_SQL);
    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply security fixes";
    return json({ error: message }, 500);
  } finally {
    await sql.end({ timeout: 5 });
  }
});