import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const start = Date.now();
  const checks: Record<string, { status: string; latency_ms?: number }> = {};

  // Database check
  try {
    const dbStart = Date.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { error } = await supabase.from("profiles").select("id").limit(1);
    checks.database = { status: error ? "degraded" : "healthy", latency_ms: Date.now() - dbStart };
  } catch {
    checks.database = { status: "unhealthy" };
  }

  // Auth check
  try {
    const authStart = Date.now();
    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/health`, {
      headers: { apikey: Deno.env.get("SUPABASE_ANON_KEY") || "" },
    });
    checks.auth = { status: res.ok ? "healthy" : "degraded", latency_ms: Date.now() - authStart };
  } catch {
    checks.auth = { status: "unhealthy" };
  }

  // Storage check
  try {
    const storageStart = Date.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { error } = await supabase.storage.listBuckets();
    checks.storage = { status: error ? "degraded" : "healthy", latency_ms: Date.now() - storageStart };
  } catch {
    checks.storage = { status: "unhealthy" };
  }

  const overall = Object.values(checks).every(c => c.status === "healthy") ? "healthy" :
    Object.values(checks).some(c => c.status === "unhealthy") ? "unhealthy" : "degraded";

  return new Response(JSON.stringify({
    status: overall,
    timestamp: new Date().toISOString(),
    total_latency_ms: Date.now() - start,
    checks,
    version: "2.0.0",
    environment: "production",
  }), {
    status: overall === "healthy" ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
