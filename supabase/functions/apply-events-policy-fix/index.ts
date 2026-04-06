import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "No DB URL" }), { status: 500 });
  }

  const sql = postgres(dbUrl, { ssl: "require" });

  try {
    // Drop the overly permissive ALL policy
    await sql.unsafe(`DROP POLICY IF EXISTS "Organizers can create and update events" ON public.events;`);

    // Create INSERT-only policy for organizers
    await sql.unsafe(`
      CREATE POLICY "Organizers can create events"
        ON public.events FOR INSERT
        TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'organizer')
          )
        );
    `);

    await sql.end();
    return new Response(JSON.stringify({ success: true, message: "Events policy fixed: ALL replaced with INSERT-only" }));
  } catch (e) {
    await sql.end();
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
