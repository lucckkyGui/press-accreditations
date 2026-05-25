import { buildCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders();

async function checkEndpoint(name: string, url: string, headers: HeadersInit = {}) {
  const start = Date.now();
  try {
    const res = await fetch(url, { headers });
    return {
      name,
      result: {
        status: res.status >= 500 ? "degraded" : "healthy",
        latency_ms: Date.now() - start,
      },
    };
  } catch {
    return {
      name,
      result: { status: "unhealthy" },
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const start = Date.now();
  const checks: Record<string, { status: string; latency_ms?: number }> = {};
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

  if (!supabaseUrl) {
    return new Response(JSON.stringify({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      total_latency_ms: Date.now() - start,
      checks: {
        configuration: { status: "unhealthy" },
      },
      version: "2.0.0",
    }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const publicHeaders = { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` };
  const results = await Promise.all([
    checkEndpoint("database", `${supabaseUrl}/rest/v1/`, { apikey: supabaseAnonKey }),
    checkEndpoint("auth", `${supabaseUrl}/auth/v1/health`, { apikey: supabaseAnonKey }),
    checkEndpoint("storage", `${supabaseUrl}/storage/v1/bucket`, publicHeaders),
  ]);

  for (const { name, result } of results) {
    checks[name] = result;
  }

  const overall = Object.values(checks).every(c => c.status === "healthy") ? "healthy" :
    Object.values(checks).some(c => c.status === "unhealthy") ? "unhealthy" : "degraded";

  return new Response(JSON.stringify({
    status: overall,
    timestamp: new Date().toISOString(),
    total_latency_ms: Date.now() - start,
    checks,
    version: "2.0.0",
  }), {
    status: overall === "healthy" ? 200 : 503,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
