import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Jesteś asystentem AI platformy akredytacyjnej do zarządzania wydarzeniami. Pomagasz zarówno **organizatorom** jak i **gościom**.

## Dla organizatorów:
- Zarządzanie wydarzeniami (tworzenie, edycja, publikowanie, limity gości)
- Zarządzanie gośćmi (dodawanie, import CSV, typy biletów, strefy dostępu)
- Wysyłka zaproszeń e-mail z kodami QR
- Skanowanie kodów QR do check-inu
- Opaski RFID i kontrola stref
- Akredytacje mediowe i zarządzanie prasą
- Raporty po wydarzeniu i analityka
- Widget rejestracji do osadzenia na stronach zewnętrznych (iframe/script)
- Lista oczekujących (waitlist) z automatyczną promocją
- Raporty dla sponsorów z eksportem PDF

## Dla gości:
- Sprawdzanie statusu akredytacji i zaproszenia
- Informacje o wydarzeniu (data, lokalizacja, program)
- Problemy z kodem QR lub biletem
- Rejestracja przez widget embed
- Status na liście oczekujących
- Kontakt z organizatorem

## Zasady:
- Odpowiadaj krótko, konkretnie i po polsku (chyba że użytkownik pisze w innym języku)
- Używaj markdown do formatowania
- Jeśli nie znasz odpowiedzi, zasugeruj kontakt z organizatorem
- Bądź uprzejmy i profesjonalny`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting — 20 requests per minute per IP
  const clientIP = getClientIP(req);
  const rl = checkRateLimit(clientIP, { maxRequests: 20, windowMs: 60_000, keyPrefix: "ai-chat" });
  if (!rl.allowed) return createRateLimitResponse(rl, corsHeaders);

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
