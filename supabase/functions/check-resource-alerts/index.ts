import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResourceLimit {
  name: string;
  table: string;
  limit: number;
  filter?: { column: string; value: string };
}

const RESOURCE_LIMITS: ResourceLimit[] = [
  { name: "Goście / Akredytacje", table: "guests", limit: 300000 },
];

const STORAGE_LIMIT_GB = 8;
const THRESHOLD = 0.8; // 80%

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin/organizer emails from profiles
    const { data: adminProfiles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "organizer"]);

    if (!adminProfiles?.length) {
      return new Response(
        JSON.stringify({ message: "No admin/organizer users found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = adminProfiles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);

    // Get admin emails from auth.users via service role
    const adminEmails: string[] = [];
    for (const uid of userIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(uid);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    const alerts: { resource: string; current: number; limit: number; percent: number }[] = [];

    // Check resource limits
    for (const resource of RESOURCE_LIMITS) {
      let query = supabase.from(resource.table).select("*", { count: "exact", head: true });
      if (resource.filter) {
        query = query.eq(resource.filter.column, resource.filter.value);
      }
      const { count } = await query;
      const current = count || 0;
      const percent = (current / resource.limit) * 100;

      if (percent >= THRESHOLD * 100) {
        alerts.push({ resource: resource.name, current, limit: resource.limit, percent: Math.round(percent) });
      }
    }

    // Check storage estimate
    const tables = ["guests", "accreditations", "invitations", "access_logs", "email_queue", "wristbands"];
    let totalRecords = 0;
    for (const table of tables) {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      totalRecords += count || 0;
    }
    const estimatedMB = Math.round(totalRecords / 1024);
    const storageLimitMB = STORAGE_LIMIT_GB * 1024;
    const storagePercent = (estimatedMB / storageLimitMB) * 100;

    if (storagePercent >= THRESHOLD * 100) {
      alerts.push({
        resource: "Storage (szacowane)",
        current: estimatedMB,
        limit: storageLimitMB,
        percent: Math.round(storagePercent),
      });
    }

    if (alerts.length === 0) {
      // Create in-app notification anyway for monitoring
      return new Response(
        JSON.stringify({ message: "All resources within limits", alerts: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create in-app notifications for all admins/organizers
    for (const uid of userIds) {
      for (const alert of alerts) {
        await supabase.from("user_notifications").insert({
          user_id: uid,
          title: "⚠️ Alert zasobów",
          message: `${alert.resource}: ${alert.percent}% wykorzystania (${alert.current.toLocaleString()} / ${alert.limit.toLocaleString()})`,
          type: "warning",
        });
      }
    }

    // Send email alerts via Resend
    if (resendApiKey && adminEmails.length > 0) {
      const resend = new Resend(resendApiKey);

      const alertRows = alerts
        .map(
          (a) =>
            `<tr>
              <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:500;">${a.resource}</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;">${a.current.toLocaleString("pl-PL")}</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;">${a.limit.toLocaleString("pl-PL")}</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;">
                <span style="background:${a.percent >= 95 ? '#ef4444' : '#f59e0b'};color:white;padding:4px 12px;border-radius:12px;font-weight:600;font-size:13px;">
                  ${a.percent}%
                </span>
              </td>
            </tr>`
        )
        .join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center;">
                <h1 style="margin:0;color:white;font-size:24px;">⚠️ Alert zasobów</h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                  Przekroczono 80% limitu zasobów
                </p>
              </div>
              <div style="padding:24px;">
                <p style="color:#374151;font-size:15px;line-height:1.6;">
                  Następujące zasoby przekroczyły próg 80% wykorzystania:
                </p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
                  <thead>
                    <tr style="background:#f3f4f6;">
                      <th style="padding:12px 16px;text-align:left;font-size:13px;color:#6b7280;text-transform:uppercase;">Zasób</th>
                      <th style="padding:12px 16px;text-align:center;font-size:13px;color:#6b7280;text-transform:uppercase;">Aktualne</th>
                      <th style="padding:12px 16px;text-align:center;font-size:13px;color:#6b7280;text-transform:uppercase;">Limit</th>
                      <th style="padding:12px 16px;text-align:center;font-size:13px;color:#6b7280;text-transform:uppercase;">Użycie</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${alertRows}
                  </tbody>
                </table>
                <p style="color:#6b7280;font-size:13px;line-height:1.5;margin-top:16px;">
                  Zalecamy rozszerzenie limitów lub optymalizację danych, aby zapobiec problemom z wydajnością.
                </p>
              </div>
              <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">EventManager – System zarządzania akredytacjami</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      for (const email of adminEmails) {
        try {
          await resend.emails.send({
            from: "EventManager <onboarding@resend.dev>",
            to: [email],
            subject: `⚠️ Alert zasobów – ${alerts.length} zasob(ów) przekroczyło 80% limitu`,
            html: emailHtml,
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ message: "Alerts processed", alerts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking resource alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
