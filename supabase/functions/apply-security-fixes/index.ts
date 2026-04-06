import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.5/mod.js");
    const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!);

    // Block authenticated users from inserting audit logs directly
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Block authenticated insert on audit_logs' AND tablename = 'audit_logs') THEN
          CREATE POLICY "Block authenticated insert on audit_logs" ON public.audit_logs
            AS RESTRICTIVE
            FOR INSERT TO authenticated
            WITH CHECK (false);
        END IF;
      END $$
    `;

    // Block authenticated users from updating audit logs
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Block authenticated update on audit_logs' AND tablename = 'audit_logs') THEN
          CREATE POLICY "Block authenticated update on audit_logs" ON public.audit_logs
            AS RESTRICTIVE
            FOR UPDATE TO authenticated
            USING (false);
        END IF;
      END $$
    `;

    // Block authenticated users from deleting audit logs
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Block authenticated delete on audit_logs' AND tablename = 'audit_logs') THEN
          CREATE POLICY "Block authenticated delete on audit_logs" ON public.audit_logs
            AS RESTRICTIVE
            FOR DELETE TO authenticated
            USING (false);
        END IF;
      END $$
    `;

    await sql.end();

    return new Response(JSON.stringify({ success: true, message: "audit_logs security policies applied" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});