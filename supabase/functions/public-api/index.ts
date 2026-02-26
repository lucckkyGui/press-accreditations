import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isValidUuid(value: string | null | undefined): value is string {
  return !!value && UUID_REGEX.test(value);
}

function hasReadPermission(permissions: unknown): boolean {
  if (!Array.isArray(permissions)) return false;
  return permissions.includes("read") || permissions.includes("*");
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function validateApiKey(supabase: any, apiKey: string) {
  const prefix = apiKey.substring(0, 8);
  const keyHash = await hashKey(apiKey);

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_prefix", prefix)
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);

  return data;
}

async function resolveAuthorizedEventId(
  supabase: any,
  keyData: any,
  requestedEventId: string | null,
): Promise<{ eventId: string | null; response?: Response }> {
  const scopedEventId = keyData.event_id as string | null;

  if (scopedEventId) {
    if (!isValidUuid(scopedEventId)) {
      return { eventId: null, response: jsonError("API key has invalid event scope", 401) };
    }

    if (requestedEventId && requestedEventId !== scopedEventId) {
      return { eventId: null, response: jsonError("API key is not authorized for the requested event", 403) };
    }

    const { data, error } = await supabase
      .from("events")
      .select("id")
      .eq("id", scopedEventId)
      .eq("organizer_id", keyData.user_id)
      .maybeSingle();

    if (error) {
      return { eventId: null, response: jsonError("Failed to validate event access", 500) };
    }

    if (!data) {
      return { eventId: null, response: jsonError("API key is not authorized for the requested event", 403) };
    }

    return { eventId: scopedEventId };
  }

  if (!requestedEventId) {
    return { eventId: null };
  }

  if (!isValidUuid(requestedEventId)) {
    return { eventId: null, response: jsonError("Invalid event_id format", 400) };
  }

  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("id", requestedEventId)
    .eq("organizer_id", keyData.user_id)
    .maybeSingle();

  if (error) {
    return { eventId: null, response: jsonError("Failed to validate event access", 500) };
  }

  if (!data) {
    return { eventId: null, response: jsonError("API key is not authorized for the requested event", 403) };
  }

  return { eventId: requestedEventId };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return jsonError("Service unavailable", 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const apiKey = req.headers.get("x-api-key")?.trim();
  if (!apiKey) {
    return jsonError("Missing x-api-key header", 401);
  }

  const keyData = await validateApiKey(supabase, apiKey);
  if (!keyData) {
    return jsonError("Invalid or expired API key", 401);
  }

  if (!hasReadPermission(keyData.permissions)) {
    return jsonError("API key does not have read permission", 403);
  }

  const url = new URL(req.url);
  const marker = "/public-api";
  const markerIndex = url.pathname.indexOf(marker);
  const rawPath = markerIndex >= 0 ? url.pathname.slice(markerIndex + marker.length).replace(/^\/+/, "") : "";
  const path = rawPath.split("/")[0] ?? "";
  const requestedEventId = url.searchParams.get("event_id");

  const scopeResolution = await resolveAuthorizedEventId(supabase, keyData, requestedEventId);
  if (scopeResolution.response) {
    return scopeResolution.response;
  }

  const authorizedEventId = scopeResolution.eventId;

  try {
    let result: any;

    if (path === "events" || path === "") {
      if (authorizedEventId) {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", authorizedEventId)
          .eq("organizer_id", keyData.user_id)
          .maybeSingle();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", keyData.user_id)
          .order("start_date", { ascending: false });
        if (error) throw error;
        result = data;
      }
    } else if (path === "guests") {
      if (!authorizedEventId) return jsonError("event_id required", 400);
      const { data, error } = await supabase.from("guests").select("*").eq("event_id", authorizedEventId);
      if (error) throw error;
      result = data;
    } else if (path === "stats") {
      if (!authorizedEventId) return jsonError("event_id required", 400);
      result = await getStats(supabase, authorizedEventId);
    } else if (path === "zones") {
      if (!authorizedEventId) return jsonError("event_id required", 400);
      const { data, error } = await supabase.from("zone_presence").select("*").eq("event_id", authorizedEventId);
      if (error) throw error;
      result = data;
    } else if (path === "access-logs") {
      if (!authorizedEventId) return jsonError("event_id required", 400);
      const rawLimit = Number.parseInt(url.searchParams.get("limit") || "100", 10);
      const limit = Number.isNaN(rawLimit) ? 100 : Math.min(Math.max(rawLimit, 1), 1000);
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .eq("event_id", authorizedEventId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      result = data;
    } else if (path === "emails") {
      if (!authorizedEventId) return jsonError("event_id required", 400);
      const { data, error } = await supabase.from("email_campaigns").select("*").eq("event_id", authorizedEventId);
      if (error) throw error;
      result = data;
    } else {
      return jsonError(`Unknown endpoint: ${path}. Available: events, guests, stats, zones, access-logs, emails`, 404);
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    return jsonError("Request failed", 500);
  }
});

async function getStats(supabase: any, eventId: string) {
  const [guests, accessLogs, campaigns] = await Promise.all([
    supabase.from("guests").select("status, zone, email_status, checked_in_at").eq("event_id", eventId),
    supabase.from("access_logs").select("action, zone_name, created_at").eq("event_id", eventId),
    supabase.from("email_campaigns").select("sent_count, opened_count, failed_count").eq("event_id", eventId),
  ]);

  const guestData = guests.data || [];
  const total = guestData.length;
  const checkedIn = guestData.filter((g: any) => g.status === "checked-in").length;
  const confirmed = guestData.filter((g: any) => g.status === "confirmed").length;
  const declined = guestData.filter((g: any) => g.status === "declined").length;

  const byZone: Record<string, { total: number; checkedIn: number }> = {};
  guestData.forEach((g: any) => {
    if (!byZone[g.zone]) byZone[g.zone] = { total: 0, checkedIn: 0 };
    byZone[g.zone].total++;
    if (g.status === "checked-in") byZone[g.zone].checkedIn++;
  });

  const emailsSent = (campaigns.data || []).reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
  const emailsOpened = (campaigns.data || []).reduce((s: number, c: any) => s + (c.opened_count || 0), 0);
  const emailsFailed = (campaigns.data || []).reduce((s: number, c: any) => s + (c.failed_count || 0), 0);

  return {
    guests: { total, checkedIn, confirmed, declined, byZone },
    emails: { sent: emailsSent, opened: emailsOpened, failed: emailsFailed },
    accessLogs: { total: (accessLogs.data || []).length },
  };
}

