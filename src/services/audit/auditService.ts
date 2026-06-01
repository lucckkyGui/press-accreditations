import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  supabase,
} from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  details: string | null;
  severity: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface FetchAuditLogsParams {
  action?: string;
  severity?: string;
  search?: string;
  resourceId?: string;
  eventId?: string;
  limit?: number;
  offset?: number;
}

export const fetchAuditLogs = async (params: FetchAuditLogsParams = {}): Promise<{ data: AuditLog[]; count: number }> => {
  const queryParams = new URLSearchParams();
  if (params.action) queryParams.set("action", params.action);
  if (params.severity) queryParams.set("severity", params.severity);
  if (params.search) queryParams.set("search", params.search);
  if (params.resourceId) queryParams.set("resource_id", params.resourceId);
  if (params.eventId) queryParams.set("event_id", params.eventId);
  if (params.limit) queryParams.set("limit", String(params.limit));
  if (params.offset) queryParams.set("offset", String(params.offset));

  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error("Missing session");
  
  const url = `${SUPABASE_URL}/functions/v1/audit-logs?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "apikey": SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch audit logs");
  }

  return response.json();
};

export const createAuditLog = async (log: {
  action: string;
  resource: string;
  resource_id?: string;
  details?: string;
  severity?: "info" | "warning" | "error";
  metadata?: Record<string, unknown>;
}): Promise<AuditLog> => {
  const { data, error } = await supabase.functions.invoke("audit-logs", {
    method: "POST",
    body: log,
  });

  if (error) throw error;
  return data;
};
