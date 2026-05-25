import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser, hasAllowedRole } from "../_shared/auth.ts";

const corsHeaders = buildCorsHeaders();
const READ_ROLES = ["admin"] as const;
const ORGANIZER_ROLES = ["admin", "organizer"] as const;
const SEVERITIES = ["info", "warning", "error"] as const;
const CLIENT_AUDIT_EVENTS = [
  { action: "login", resource: "auth", severity: "info", roles: null },
  { action: "logout", resource: "auth", severity: "info", roles: null },
  { action: "update", resource: "settings", severity: "info", roles: null },
  { action: "create", resource: "events", severity: "info", roles: ORGANIZER_ROLES },
  { action: "update", resource: "events", severity: "info", roles: ORGANIZER_ROLES },
  { action: "delete", resource: "events", severity: "warning", roles: ORGANIZER_ROLES },
  { action: "create", resource: "guests", severity: "info", roles: ORGANIZER_ROLES },
  { action: "delete", resource: "guests", severity: "warning", roles: ORGANIZER_ROLES },
  { action: "bulk_delete", resource: "guests", severity: "warning", roles: ORGANIZER_ROLES },
  { action: "approve", resource: "accreditations", severity: "info", roles: ORGANIZER_ROLES },
  { action: "revoke", resource: "accreditations", severity: "warning", roles: ORGANIZER_ROLES },
  { action: "role_change", resource: "user_roles", severity: "warning", roles: READ_ROLES },
] as const;

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function boundedInteger(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function sanitizeSearch(value: string | null) {
  return value?.replace(/[^a-zA-Z0-9 @._-]/g, "").trim().slice(0, 100) || "";
}

function sanitizeResourceId(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^[a-zA-Z0-9:_-]{1,128}$/.test(trimmed) ? trimmed : null;
}

function resolveClientAuditEvent(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const { action, resource, resource_id } = body as {
    action?: unknown;
    resource?: unknown;
    resource_id?: unknown;
  };

  if (typeof action !== "string" || typeof resource !== "string") return null;

  const event = CLIENT_AUDIT_EVENTS.find(
    (item) => item.action === action && item.resource === resource,
  );
  if (!event) return null;

  return {
    event,
    resourceId: sanitizeResourceId(resource_id),
  };
}

function buildDetails(action: string, resource: string, resourceId: string | null, userEmail?: string) {
  if (action === "login") return `User logged in${userEmail ? `: ${userEmail}` : ""}`;
  if (action === "logout") return "User logged out";
  const suffix = resourceId ? ` (${resourceId})` : "";
  return `${action} ${resource}${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);

    if (req.method === "GET") {
      const canReadLogs = await hasAllowedRole(supabaseAdmin, user.id, READ_ROLES);
      if (!canReadLogs) return jsonResponse({ error: "Forbidden" }, 403);

      const action = url.searchParams.get("action");
      const severity = url.searchParams.get("severity");
      const search = sanitizeSearch(url.searchParams.get("search"));
      const limit = boundedInteger(url.searchParams.get("limit"), 100, 1, 200);
      const offset = boundedInteger(url.searchParams.get("offset"), 0, 0, 10_000);

      let query = supabaseAdmin
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (action && action !== "all") {
        query = query.eq("action", action);
      }
      if (severity && severity !== "all" && SEVERITIES.includes(severity as typeof SEVERITIES[number])) {
        query = query.eq("severity", severity);
      }
      if (search) {
        query = query.or(`details.ilike.%${search}%,user_email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return jsonResponse({ data, count }, 200);
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      const resolved = resolveClientAuditEvent(body);
      if (!resolved) return jsonResponse({ error: "Unsupported audit event" }, 400);

      const { event, resourceId } = resolved;
      if (event.roles) {
        const canWriteEvent = await hasAllowedRole(supabaseAdmin, user.id, event.roles);
        if (!canWriteEvent) return jsonResponse({ error: "Forbidden" }, 403);
      }

      const { data, error } = await supabaseAdmin.from("audit_logs").insert({
        user_id: user.id,
        user_email: user.email,
        action: event.action,
        resource: event.resource,
        resource_id: resourceId,
        details: buildDetails(event.action, event.resource, resourceId, user.email),
        severity: event.severity,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
        user_agent: req.headers.get("user-agent") || null,
        metadata: { source: "client_audit_hook" },
      }).select().single();

      if (error) throw error;

      return jsonResponse(data, 201);
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("audit-logs error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
