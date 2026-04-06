import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Use the postgres driver to execute DDL
    const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.5/mod.js");
    const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!;
    const sql = postgres(databaseUrl);

    await sql`
      CREATE TABLE IF NOT EXISTS public.audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid,
        user_email text,
        action text NOT NULL,
        resource text NOT NULL,
        resource_id text,
        details text,
        severity text NOT NULL DEFAULT 'info',
        ip_address text,
        user_agent text,
        metadata jsonb DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity)`;

    await sql`ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY`;

    // RLS: admins and organizers can read all logs
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all audit logs' AND tablename = 'audit_logs') THEN
          CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
            FOR SELECT TO authenticated
            USING (public.is_admin(auth.uid()));
        END IF;
      END $$
    `;

    // Organizers can see logs related to their own actions
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own audit logs' AND tablename = 'audit_logs') THEN
          CREATE POLICY "Users can view own audit logs" ON public.audit_logs
            FOR SELECT TO authenticated
            USING (user_id = auth.uid());
        END IF;
      END $$
    `;

    // Service role inserts only (edge functions use service role)
    await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Block anon access to audit_logs' AND tablename = 'audit_logs') THEN
          CREATE POLICY "Block anon access to audit_logs" ON public.audit_logs
            FOR ALL TO anon
            USING (false)
            WITH CHECK (false);
        END IF;
      END $$
    `;

    await sql.end();

    return new Response(JSON.stringify({ success: true, message: "audit_logs table created" }), {
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