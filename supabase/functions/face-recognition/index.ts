import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_IMAGE_PREFIX = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_BASE64_CHARS = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 1024;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function validateAndDecodeImage(dataUrl: unknown): { ok: true; bytes: Uint8Array } | { ok: false; error: string } {
  if (typeof dataUrl !== "string" || !ALLOWED_IMAGE_PREFIX.test(dataUrl)) {
    return { ok: false, error: "Invalid image format" };
  }

  if (dataUrl.length > MAX_BASE64_CHARS) {
    return { ok: false, error: "Image too large" };
  }

  const base64Part = dataUrl.split(",")[1];
  if (!base64Part) {
    return { ok: false, error: "Invalid image payload" };
  }

  try {
    const decoded = atob(base64Part);
    const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false, error: "Image too large" };
    }

    return { ok: true, bytes };
  } catch {
    return { ok: false, error: "Invalid base64 image data" };
  }
}

async function canManageEventFaceData(supabase: any, userId: string, eventId: string): Promise<boolean> {
  const [organizerRes, adminRes, staffRes] = await Promise.all([
    supabase.rpc("is_event_organizer", { _user_id: userId, _event_id: eventId }),
    supabase.rpc("is_admin", { _user_id: userId }),
    supabase.rpc("has_role", { _user_id: userId, _role: "staff" }),
  ]);

  if (organizerRes.error || adminRes.error || staffRes.error) {
    throw new Error("Authorization check failed");
  }

  return Boolean(organizerRes.data) || Boolean(adminRes.data) || Boolean(staffRes.data);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return jsonError("Service unavailable", 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonError("Unauthorized", 401);
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    return jsonError("Unauthorized", 401);
  }

  const userId = claimsData.claims.sub;
  if (!isValidUuid(userId)) {
    return jsonError("Unauthorized", 401);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const action = body?.action;
    const capturedImageBase64 = body?.capturedImageBase64;
    const eventId = body?.eventId;
    const guestId = body?.guestId;

    if (action !== "enroll" && action !== "recognize") {
      return jsonError("Invalid action", 400);
    }

    if (!isValidUuid(eventId)) {
      return jsonError("Invalid eventId format", 400);
    }

    const imageValidation = validateAndDecodeImage(capturedImageBase64);
    if (!imageValidation.ok) {
      return jsonError(imageValidation.error, 400);
    }

    const authorized = await canManageEventFaceData(supabase, userId, eventId);
    if (!authorized) {
      return jsonError("Forbidden", 403);
    }

    if (action === "enroll") {
      if (!isValidUuid(guestId)) {
        return jsonError("Invalid guestId format", 400);
      }

      const { data: guestRecord, error: guestError } = await supabase
        .from("guests")
        .select("id")
        .eq("id", guestId)
        .eq("event_id", eventId)
        .maybeSingle();

      if (guestError) throw guestError;
      if (!guestRecord) {
        return jsonError("Guest not found for this event", 404);
      }

      const filePath = `${eventId}/${guestId}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("face_photos")
        .upload(filePath, imageValidation.bytes, { contentType: "image/jpeg", upsert: true });

      if (uploadError) {
        console.error("Face photo upload failed", uploadError.message);
        return jsonError("Failed to upload face photo", 500);
      }

      const { data: signedData } = await supabase.storage.from("face_photos").createSignedUrl(filePath, 60 * 60 * 24 * 365);

      const { error: updateGuestError } = await supabase
        .from("guests")
        .update({ face_photo_url: signedData?.signedUrl || filePath })
        .eq("id", guestId)
        .eq("event_id", eventId);

      if (updateGuestError) throw updateGuestError;

      return jsonResponse({ success: true, message: "Zdjęcie twarzy zapisane" });
    }

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY missing for face recognition");
      return jsonError("Recognition service unavailable", 500);
    }

    const { data: guests, error: guestsError } = await supabase
      .from("guests")
      .select("id, first_name, last_name, email, company, zone, status, face_photo_url, checked_in_at, qr_code")
      .eq("event_id", eventId)
      .not("face_photo_url", "is", null);

    if (guestsError) throw guestsError;
    if (!guests || guests.length === 0) {
      return jsonResponse({ success: false, message: "Brak zarejestrowanych twarzy dla tego wydarzenia" });
    }

    const guestImages: { guestId: string; name: string; imageUrl: string }[] = [];
    for (const guest of guests) {
      const filePath = `${eventId}/${guest.id}.jpg`;
      const { data: signedData } = await supabase.storage.from("face_photos").createSignedUrl(filePath, 300);
      if (signedData?.signedUrl) {
        guestImages.push({
          guestId: guest.id,
          name: `${guest.first_name} ${guest.last_name}`,
          imageUrl: signedData.signedUrl,
        });
      }
    }

    if (guestImages.length === 0) {
      return jsonResponse({ success: false, message: "Brak dostępnych zdjęć do porównania" });
    }

    const guestListText = guestImages
      .map((g, i) => `Guest ${i + 1}: ${g.name} (ID: ${g.guestId})`)
      .join("\n");

    const contentParts: any[] = [
      {
        type: "text",
        text: `You are a facial recognition system for event check-in. Compare the FIRST image (the captured photo from the camera) with the subsequent enrolled guest photos. Determine which enrolled guest matches the captured face.

Here are the enrolled guests:
${guestListText}

IMPORTANT:
- If you find a match, respond ONLY with a JSON object: {"match": true, "guestId": "the-guest-id", "confidence": 0.95, "name": "Guest Name"}
- If no match is found, respond ONLY with: {"match": false, "confidence": 0, "name": ""}
- Be strict about matching - the face must clearly be the same person.
- Return ONLY valid JSON, nothing else.`,
      },
      {
        type: "image_url",
        image_url: { url: capturedImageBase64 },
      },
    ];

    for (const guest of guestImages.slice(0, 10)) {
      contentParts.push({
        type: "text",
        text: `Enrolled photo for ${guest.name} (ID: ${guest.guestId}):`,
      });
      contentParts.push({
        type: "image_url",
        image_url: { url: guest.imageUrl },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: contentParts }],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return jsonError("Zbyt wiele żądań, spróbuj ponownie", 429);
      }
      if (aiResponse.status === 402) {
        return jsonError("Brak kredytów AI", 402);
      }
      console.error("AI gateway request failed", { status: aiResponse.status });
      return jsonError("Recognition service unavailable", 502);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    let matchResult;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      matchResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { match: false };
    } catch {
      matchResult = { match: false };
    }

    if (matchResult.match && isValidUuid(matchResult.guestId)) {
      const matchedGuest = guests.find((g) => g.id === matchResult.guestId);
      if (matchedGuest) {
        if (matchedGuest.checked_in_at) {
          return jsonResponse({
            success: true,
            alreadyCheckedIn: true,
            guest: {
              id: matchedGuest.id,
              firstName: matchedGuest.first_name,
              lastName: matchedGuest.last_name,
              email: matchedGuest.email,
              company: matchedGuest.company,
              zone: matchedGuest.zone,
              status: matchedGuest.status,
            },
            confidence: matchResult.confidence,
            message: `${matchedGuest.first_name} ${matchedGuest.last_name} — już zarejestrowany`,
          });
        }

        const now = new Date().toISOString();
        const { error: updateError } = await supabase
          .from("guests")
          .update({ checked_in_at: now, status: "checked-in" })
          .eq("id", matchedGuest.id)
          .eq("event_id", eventId);

        if (updateError) throw updateError;

        return jsonResponse({
          success: true,
          alreadyCheckedIn: false,
          guest: {
            id: matchedGuest.id,
            firstName: matchedGuest.first_name,
            lastName: matchedGuest.last_name,
            email: matchedGuest.email,
            company: matchedGuest.company,
            zone: matchedGuest.zone,
            status: "checked-in",
          },
          confidence: matchResult.confidence,
          message: `Zarejestrowano: ${matchedGuest.first_name} ${matchedGuest.last_name}`,
        });
      }
    }

    return jsonResponse({
      success: false,
      message: "Nie rozpoznano twarzy — spróbuj ponownie lub użyj kodu QR",
      confidence: matchResult?.confidence || 0,
    });
  } catch (error) {
    console.error("face-recognition error", error instanceof Error ? error.message : "unknown");
    return jsonError("Recognition request failed", 500);
  }
});

