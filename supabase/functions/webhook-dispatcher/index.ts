import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { event_type, event_id, payload } = await req.json();

    if (!event_type || !event_id) {
      return new Response(JSON.stringify({ error: 'event_type and event_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
          // Increment failure count
          await supabase.from('webhook_subscriptions').update({
            failure_count: sub.failure_count + 1,
            updated_at: new Date().toISOString(),
            // Deactivate after 10 consecutive failures
            ...(sub.failure_count >= 9 ? { is_active: false } : {}),
          }).eq('id', sub.id);
          throw new Error(`Webhook ${sub.url} returned ${response.status}`);
        } else {
          // Reset failure count on success
          await supabase.from('webhook_subscriptions').update({
            failure_count: 0,
            last_triggered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', sub.id);
        }

        // Consume response body
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
