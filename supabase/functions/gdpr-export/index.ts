import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const rl = checkRateLimit(clientIP, { maxRequests: 5, windowMs: 60_000, keyPrefix: "gdpr" });
  if (!rl.allowed) return createRateLimitResponse(rl, corsHeaders);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();

    if (action === "export") {
      // GDPR Data Export — collect all user data
      const [profile, roles, events, notifications, accRequests, mediaRegs, docs, chatConvos] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_roles").select("role, created_at").eq("user_id", user.id),
        supabase.from("events").select("id, title, start_date, end_date, location, category, created_at").eq("organizer_id", user.id),
        supabase.from("user_notifications").select("title, message, type, created_at, is_read").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
        supabase.from("accreditation_requests").select("media_name, media_type, contact_email, status, created_at").eq("user_id", user.id),
        supabase.from("media_registrations").select("media_organization, job_title, status, created_at").eq("user_id", user.id),
        supabase.from("document_submissions").select("title, file_name, status, created_at").eq("user_id", user.id),
        supabase.from("chat_conversations").select("title, created_at").eq("created_by", user.id),
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: profile.data,
        roles: roles.data,
        events: events.data,
        notifications: notifications.data,
        accreditation_requests: accRequests.data,
        media_registrations: mediaRegs.data,
        documents: docs.data,
        conversations: chatConvos.data,
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="gdpr-export-${user.id}.json"`,
        },
      });
    }

    if (action === "delete") {
      // GDPR Right to Erasure — delete all user data
      // Order matters due to foreign key constraints

      // Delete user-related data
      await Promise.all([
        supabase.from("user_notifications").delete().eq("user_id", user.id),
        supabase.from("user_roles").delete().eq("user_id", user.id),
        supabase.from("document_comments").delete().eq("user_id", user.id),
        supabase.from("chat_conversations").delete().eq("created_by", user.id),
      ]);

      // Delete document submissions
      await supabase.from("document_submissions").delete().eq("user_id", user.id);

      // Delete media related
      const { data: mediaRegs } = await supabase
        .from("media_registrations")
        .select("id")
        .eq("user_id", user.id);

      if (mediaRegs && mediaRegs.length > 0) {
        const regIds = mediaRegs.map(r => r.id);
        await supabase.from("media_documents").delete().in("registration_id", regIds);
        await supabase.from("media_registrations").delete().eq("user_id", user.id);
      }

      // Delete accreditations and requests
      await supabase.from("accreditations").delete().eq("user_id", user.id);
      await supabase.from("accreditation_requests").delete().eq("user_id", user.id);

      // Anonymize profile
      await supabase.from("profiles").update({
        first_name: "[usunięto]",
        last_name: "[usunięto]",
        phone: null,
        avatar_url: null,
        organization_name: null,
      }).eq("id", user.id);

      // Delete auth user (this cascades profile via FK)
      await supabase.auth.admin.deleteUser(user.id);

      return new Response(JSON.stringify({
        success: true,
        message: "Wszystkie dane osobowe zostały usunięte zgodnie z RODO Art. 17",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: export, delete" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("GDPR error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
