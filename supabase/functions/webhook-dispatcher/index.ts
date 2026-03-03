import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitResult = checkRateLimit(clientIP, {
      maxRequests: 20,
      windowMs: 60_000,
      keyPrefix: 'webhook-dispatch',
    });
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    // JWT Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('Unauthorized', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return jsonError('Unauthorized', 401);
    }

    const userId = userData.user.id;

    const { event_type, event_id, payload } = await req.json();

    if (!event_type || !event_id) {
      return jsonError('event_type and event_id required', 400);
    }

    // Verify user owns the event or is admin
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return jsonError('Event not found', 404);
    }

    const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: userId });

    if (event.organizer_id !== userId && !isAdmin) {
      return jsonError('Forbidden - not event owner or admin', 403);
    }

    // Find active webhook subscriptions for this event
    const { data: subscriptions, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('is_active', true)
      .or(`event_id.eq.${event_id},event_id.is.null`)
      .contains('events', [event_type]);

    if (error) throw error;

    const results = await Promise.allSettled(
      (subscriptions || []).map(async (sub: any) => {
        const body = JSON.stringify({
          event: event_type,
          event_id,
          timestamp: new Date().toISOString(),
          data: payload,
        });

        // Create HMAC signature
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw', encoder.encode(sub.secret),
          { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
        const signatureHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

        const response = await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signatureHex,
            'X-Webhook-Event': event_type,
          },
          body,
        });

        if (!response.ok) {
          await supabase.from('webhook_subscriptions').update({
            failure_count: sub.failure_count + 1,
            updated_at: new Date().toISOString(),
            ...(sub.failure_count >= 9 ? { is_active: false } : {}),
          }).eq('id', sub.id);
          throw new Error(`Webhook ${sub.url} returned ${response.status}`);
        } else {
          await supabase.from('webhook_subscriptions').update({
            failure_count: 0,
            last_triggered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', sub.id);
        }

        await response.text();
        return { id: sub.id, status: 'delivered' };
      })
    );

    const delivered = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(JSON.stringify({ delivered, failed, total: results.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
