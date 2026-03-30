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
    const { eventId, action, guestIds } = await req.json();

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "eventId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and check if user is event organizer
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership
    const { data: event } = await supabase
      .from("events")
      .select("id, max_guests, organizer_id")
      .eq("id", eventId)
      .single();

    if (!event || event.organizer_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "promote-specific" && Array.isArray(guestIds) && guestIds.length > 0) {
      // Promote specific guests
      const { data: promoted, error: promoteError } = await supabase
        .from("guests")
        .update({ status: "confirmed" })
        .in("id", guestIds)
        .eq("event_id", eventId)
        .eq("status", "waitlisted")
        .select("id, first_name, last_name, email");

      if (promoteError) {
        return new Response(
          JSON.stringify({ error: promoteError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ promoted: promoted?.length || 0, guests: promoted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "auto-promote") {
      // Auto-promote: fill available spots from waitlist (FIFO)
      const { count: confirmedCount } = await supabase
        .from("guests")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .in("status", ["confirmed", "checked-in"]);

      const maxGuests = event.max_guests || Infinity;
      const available = Math.max(0, maxGuests - (confirmedCount || 0));

      if (available === 0) {
        return new Response(
          JSON.stringify({ promoted: 0, message: "Brak wolnych miejsc" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get waitlisted guests ordered by creation date (FIFO)
      const { data: waitlisted } = await supabase
        .from("guests")
        .select("id")
        .eq("event_id", eventId)
        .eq("status", "waitlisted")
        .order("created_at", { ascending: true })
        .limit(available);

      if (!waitlisted || waitlisted.length === 0) {
        return new Response(
          JSON.stringify({ promoted: 0, message: "Brak gości na waitliście" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ids = waitlisted.map((g) => g.id);
      const { data: promoted, error: promoteError } = await supabase
        .from("guests")
        .update({ status: "confirmed" })
        .in("id", ids)
        .select("id, first_name, last_name, email");

      if (promoteError) {
        return new Response(
          JSON.stringify({ error: promoteError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          promoted: promoted?.length || 0,
          guests: promoted,
          message: `Przeniesiono ${promoted?.length || 0} gości z waitlisty`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "remove") {
      // Remove from waitlist (set to declined)
      const { data: removed } = await supabase
        .from("guests")
        .update({ status: "declined" })
        .in("id", guestIds || [])
        .eq("event_id", eventId)
        .eq("status", "waitlisted")
        .select("id");

      return new Response(
        JSON.stringify({ removed: removed?.length || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: auto-promote, promote-specific, remove" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Waitlist error:", e);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
