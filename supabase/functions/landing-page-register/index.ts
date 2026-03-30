import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT = { maxRequests: 5, windowMs: 60_000, keyPrefix: "landing-register" };

// Simple input sanitizer — strip HTML tags
const sanitize = (val: unknown): string => {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const rl = checkRateLimit(getClientIP(req), RATE_LIMIT);
  if (!rl.allowed) return createRateLimitResponse(rl, corsHeaders);

  try {
    const body = await req.json();

    // Honeypot check — if the hidden field is filled, it's a bot
    if (body._website || body._hp_field) {
      // Silently accept to not tip off the bot
      return new Response(
        JSON.stringify({ success: true, id: "00000000-0000-0000-0000-000000000000" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Timing check — if submitted in less than 3 seconds, likely a bot
    if (body._form_loaded_at) {
      const elapsed = Date.now() - Number(body._form_loaded_at);
      if (elapsed < 3000) {
        return new Response(
          JSON.stringify({ success: true, id: "00000000-0000-0000-0000-000000000000" }),
          { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const slug = sanitize(body.slug);
    const first_name = sanitize(body.first_name);
    const last_name = sanitize(body.last_name);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const media_organization = sanitize(body.media_organization);
    const job_title = sanitize(body.job_title);
    const social_media = sanitize(body.social_media);
    const portfolio_url = sanitize(body.portfolio_url);
    const coverage_description = sanitize(body.coverage_description);
    const previous_accreditation = body.previous_accreditation === true;
    const accreditation_type = sanitize(body.accreditation_type);
    const custom_fields = typeof body.custom_fields === "object" && body.custom_fields !== null
      ? body.custom_fields
      : {};

    // Validate required fields
    if (!slug || !first_name || !last_name || !email) {
      return new Response(
        JSON.stringify({ error: "Brakuje wymaganych pól (imię, nazwisko, email)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format (stricter)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowy format adresu email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Block disposable email domains (common ones)
    const disposableDomains = [
      "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
      "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
      "10minutemail.com", "trashmail.com", "temp-mail.org", "fakeinbox.com",
    ];
    const emailDomain = email.split("@")[1];
    if (disposableDomains.includes(emailDomain)) {
      return new Response(
        JSON.stringify({ error: "Proszę użyć służbowego adresu email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate field lengths
    if (first_name.length > 100 || last_name.length > 100 || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Przekroczono maksymalną długość pola" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL fields if provided
    if (portfolio_url && portfolio_url.length > 0) {
      try {
        const url = new URL(portfolio_url);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        return new Response(
          JSON.stringify({ error: "Nieprawidłowy format URL portfolio" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find landing page by slug
    const { data: landingPage, error: lpError } = await supabaseAdmin
      .from("event_landing_pages")
      .select("id, event_id, is_active, form_config")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (lpError || !landingPage) {
      return new Response(
        JSON.stringify({ error: "Strona rejestracji nie została znaleziona lub jest nieaktywna" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate submission
    const { data: existing } = await supabaseAdmin
      .from("landing_page_submissions")
      .select("id")
      .eq("landing_page_id", landingPage.id)
      .eq("email", email)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Ten adres email został już zarejestrowany na to wydarzenie" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields from form_config
    const formConfig = landingPage.form_config as any;
    if (formConfig?.fields) {
      for (const field of formConfig.fields) {
        if (field.required && field.visible && !["first_name", "last_name", "email"].includes(field.key)) {
          const value = body[field.key];
          if (!value || (typeof value === "string" && value.trim() === "")) {
            return new Response(
              JSON.stringify({ error: `Pole "${field.label}" jest wymagane` }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    // Insert submission
    const { data: submission, error: insertError } = await supabaseAdmin
      .from("landing_page_submissions")
      .insert({
        landing_page_id: landingPage.id,
        event_id: landingPage.event_id,
        first_name,
        last_name,
        email,
        phone: phone || null,
        media_organization: media_organization || null,
        job_title: job_title || null,
        social_media: social_media || null,
        portfolio_url: portfolio_url || null,
        coverage_description: coverage_description || null,
        previous_accreditation,
        accreditation_type: accreditation_type || null,
        custom_fields,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Błąd zapisu zgłoszenia. Spróbuj ponownie." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send confirmation email via Resend
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Akredytacje <noreply@notify.bookingartistagency.com>",
            to: [email],
            subject: "Potwierdzenie zgłoszenia akredytacyjnego",
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
                <h2>Dziękujemy za zgłoszenie!</h2>
                <p>Twoje zgłoszenie akredytacyjne zostało przyjęte i oczekuje na rozpatrzenie.</p>
                <p><strong>${first_name} ${last_name}</strong></p>
                ${media_organization ? `<p>Redakcja: ${media_organization}</p>` : ""}
                ${accreditation_type ? `<p>Typ akredytacji: ${accreditation_type}</p>` : ""}
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #6b7280; font-size: 12px;">Otrzymasz powiadomienie o decyzji na ten adres email.</p>
              </div>
            `,
          }),
        });
      }
    } catch (emailErr) {
      console.error("Email send failed (non-critical):", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, id: submission.id }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
