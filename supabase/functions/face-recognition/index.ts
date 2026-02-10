import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, capturedImageBase64, eventId, guestId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ACTION: enroll — save face photo for a guest
    if (action === "enroll") {
      if (!guestId || !capturedImageBase64) {
        return new Response(JSON.stringify({ error: "Missing guestId or image" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Decode and upload to storage
      const imageData = capturedImageBase64.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0));
      const filePath = `${eventId}/${guestId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("face_photos")
        .upload(filePath, bytes, { contentType: "image/jpeg", upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(JSON.stringify({ error: "Failed to upload face photo" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get signed URL and save to guest
      const { data: signedData } = await supabase.storage
        .from("face_photos")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

      await supabase
        .from("guests")
        .update({ face_photo_url: signedData?.signedUrl || filePath })
        .eq("id", guestId);

      return new Response(JSON.stringify({ success: true, message: "Zdjęcie twarzy zapisane" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: recognize — match captured face against enrolled guests
    if (action === "recognize") {
      if (!capturedImageBase64 || !eventId) {
        return new Response(JSON.stringify({ error: "Missing image or eventId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get all guests with enrolled face photos for this event
      const { data: guests, error: guestsError } = await supabase
        .from("guests")
        .select("id, first_name, last_name, email, company, zone, status, face_photo_url, checked_in_at, qr_code")
        .eq("event_id", eventId)
        .not("face_photo_url", "is", null);

      if (guestsError || !guests || guests.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Brak zarejestrowanych twarzy dla tego wydarzenia",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build image URLs for comparison - get fresh signed URLs
      const guestImages: { guestId: string; name: string; imageUrl: string }[] = [];
      for (const guest of guests) {
        const filePath = `${eventId}/${guest.id}.jpg`;
        const { data: signedData } = await supabase.storage
          .from("face_photos")
          .createSignedUrl(filePath, 300);
        if (signedData?.signedUrl) {
          guestImages.push({
            guestId: guest.id,
            name: `${guest.first_name} ${guest.last_name}`,
            imageUrl: signedData.signedUrl,
          });
        }
      }

      if (guestImages.length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: "Brak dostępnych zdjęć do porównania" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use Gemini Vision to compare the captured face with enrolled guests
      // We send the captured image + a list of guest names, asking to identify who it is
      const guestListText = guestImages
        .map((g, i) => `Guest ${i + 1}: ${g.name} (ID: ${g.guestId})`)
        .join("\n");

      // Download enrolled photos and build content parts
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

      // Add enrolled guest photos (max 10 to stay within limits)
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
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: contentParts }],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Zbyt wiele żądań, spróbuj ponownie" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Brak kredytów AI" }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await aiResponse.text();
        console.error("AI error:", aiResponse.status, errText);
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices?.[0]?.message?.content || "";

      // Parse AI response
      let matchResult;
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        matchResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { match: false };
      } catch {
        console.error("Failed to parse AI response:", aiContent);
        matchResult = { match: false };
      }

      if (matchResult.match && matchResult.guestId) {
        const matchedGuest = guests.find((g) => g.id === matchResult.guestId);
        if (matchedGuest) {
          // Check if already checked in
          if (matchedGuest.checked_in_at) {
            return new Response(
              JSON.stringify({
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
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Check in the guest
          const now = new Date().toISOString();
          await supabase
            .from("guests")
            .update({ checked_in_at: now, status: "checked-in" })
            .eq("id", matchedGuest.id);

          return new Response(
            JSON.stringify({
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
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: "Nie rozpoznano twarzy — spróbuj ponownie lub użyj kodu QR",
          confidence: matchResult.confidence || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("face-recognition error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
