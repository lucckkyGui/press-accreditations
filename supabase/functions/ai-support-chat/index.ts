import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";

const corsHeaders = buildCorsHeaders();
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 2_000;
const MAX_TOTAL_CHARS = 8_000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function normalizeMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== "object") return null;

  const rawBody = body as { messages?: unknown; message?: unknown };
  const rawMessages = Array.isArray(rawBody.messages)
    ? rawBody.messages
    : typeof rawBody.message === "string"
      ? [{ role: "user", content: rawBody.message }]
      : null;

  if (!rawMessages || rawMessages.length === 0 || rawMessages.length > MAX_MESSAGES) {
    return null;
  }

  let totalChars = 0;
  const messages: ChatMessage[] = [];
  for (const rawMessage of rawMessages) {
    if (!rawMessage || typeof rawMessage !== "object") return null;
    const { role, content } = rawMessage as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;

    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length > MAX_MESSAGE_CHARS) return null;
    totalChars += trimmedContent.length;
    if (totalChars > MAX_TOTAL_CHARS) return null;

    messages.push({ role, content: trimmedContent });
  }

  return messages;
}

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

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Rate limiting — authenticated user limit plus coarse IP backstop.
  const clientIP = getClientIP(req);
  const userRateLimit = checkRateLimit(user.id, { maxRequests: 20, windowMs: 60_000, keyPrefix: "ai-chat-user" });
  if (!userRateLimit.allowed) return createRateLimitResponse(userRateLimit, corsHeaders);

  const ipRateLimit = checkRateLimit(clientIP, { maxRequests: 60, windowMs: 60_000, keyPrefix: "ai-chat-ip" });
  if (!ipRateLimit.allowed) return createRateLimitResponse(ipRateLimit, corsHeaders);

  try {
    const body = await req.json();
    const messages = normalizeMessages(body);
    if (!messages) {
      return new Response(
        JSON.stringify({ error: "Invalid messages payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
      JSON.stringify({ error: "AI service unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
