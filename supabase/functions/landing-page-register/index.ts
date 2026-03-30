import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      slug,
      first_name,
      last_name,
      email,
      phone,
      media_organization,
      job_title,
      social_media,
      portfolio_url,
      coverage_description,
      previous_accreditation,
      accreditation_type,
      custom_fields,
    } = body;

    // Validate required fields
    if (!slug || !first_name || !last_name || !email) {
      return new Response(
        JSON.stringify({ error: "Brakuje wymaganych pól (imię, nazwisko, email)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowy format adresu email" }),
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
      .eq("email", email.toLowerCase().trim())
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
        if (field.required && field.visible && field.key !== "first_name" && field.key !== "last_name" && field.key !== "email") {
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
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        media_organization: media_organization?.trim() || null,
        job_title: job_title?.trim() || null,
        social_media: social_media?.trim() || null,
        portfolio_url: portfolio_url?.trim() || null,
        coverage_description: coverage_description?.trim() || null,
        previous_accreditation: previous_accreditation || false,
        accreditation_type: accreditation_type || null,
        custom_fields: custom_fields || {},
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

    // Optionally send confirmation email via Resend
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
