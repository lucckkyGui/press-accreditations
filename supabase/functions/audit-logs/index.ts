import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { buildCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const url = new URL(req.url);

    if (req.method === "GET") {
      // Odczyt logów wyłącznie dla admina — strona /audit-trail jest admin-only,
      // a service role poniżej omija RLS, więc gate musi być tutaj (nie tylko client-side).
      const supabaseAdminCheck = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: adminRole } = await supabaseAdminCheck
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!adminRole) {
        return new Response(JSON.stringify({ error: "Forbidden - admin only" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
      // Read audit logs
      const action = url.searchParams.get("action");
      const severity = url.searchParams.get("severity");
      const search = url.searchParams.get("search");
      const resourceId = url.searchParams.get("resource_id");
      const eventId = url.searchParams.get("event_id");
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      let query = supabaseAdmin
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (action && action !== "all") {
        query = query.eq("action", action);
      }
      if (severity && severity !== "all") {
        query = query.eq("severity", severity);
      }
      if (search) {
        // Escape znaków sterujących filtrów PostgREST (przecinek rozdziela warunki .or)
        const safe = search.replace(/[,%()]/g, " ").trim();
        if (safe) {
          query = query.or(`details.ilike.%${safe}%,user_email.ilike.%${safe}%`);
        }
      }
      if (resourceId) {
        query = query.eq("resource_id", resourceId);
      }
      if (eventId) {
        // event_id przechowywany w metadata jsonb
        query = query.contains("metadata", { event_id: eventId });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({ data, count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (req.method === "POST") {
      // Write audit log
      const body = await req.json();
      const { action, resource, resource_id, details, severity, metadata } = body;

      if (!action || !resource) {
        return new Response(JSON.stringify({ error: "action and resource are required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Twarde limity treści — tożsamość (user_id/email/ip/ua) i tak narzucana z JWT/nagłówków.
      const ALLOWED_SEVERITIES = ["info", "warning", "error", "critical"];
      if (severity && !ALLOWED_SEVERITIES.includes(severity)) {
        return new Response(JSON.stringify({ error: "invalid severity" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      if (String(action).length > 100 || String(resource).length > 100 || (details && String(details).length > 2000)) {
        return new Response(JSON.stringify({ error: "field too long" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data, error } = await supabaseAdmin.from("audit_logs").insert({
        user_id: user.id,
        user_email: user.email,
        action,
        resource,
        resource_id: resource_id || null,
        details: details || null,
        severity: severity || "info",
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
        user_agent: req.headers.get("user-agent") || null,
        metadata: metadata || {},
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
