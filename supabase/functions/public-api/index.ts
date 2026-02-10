import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function validateApiKey(supabase: any, apiKey: string) {
  const prefix = apiKey.substring(0, 8);
  const keyHash = await hashKey(apiKey);

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_prefix', prefix)
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  // Update last_used_at
  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id);

  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Validate API key
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing x-api-key header' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const keyData = await validateApiKey(supabase, apiKey);
  if (!keyData) {
    return new Response(JSON.stringify({ error: 'Invalid or expired API key' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/public-api\/?/, '');
  const eventId = keyData.event_id || url.searchParams.get('event_id');

  try {
    let result: any;

    if (path === 'events' || path === '') {
      if (eventId) {
        const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase.from('events').select('*').eq('organizer_id', keyData.user_id).order('start_date', { ascending: false });
        if (error) throw error;
        result = data;
      }
    } else if (path === 'guests') {
      if (!eventId) return jsonError('event_id required', 400);
      const { data, error } = await supabase.from('guests').select('*').eq('event_id', eventId);
      if (error) throw error;
      result = data;
    } else if (path === 'stats') {
      if (!eventId) return jsonError('event_id required', 400);
      result = await getStats(supabase, eventId);
    } else if (path === 'zones') {
      if (!eventId) return jsonError('event_id required', 400);
      const { data, error } = await supabase.from('zone_presence').select('*').eq('event_id', eventId);
      if (error) throw error;
      result = data;
    } else if (path === 'access-logs') {
      if (!eventId) return jsonError('event_id required', 400);
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const { data, error } = await supabase.from('access_logs').select('*').eq('event_id', eventId).order('created_at', { ascending: false }).limit(Math.min(limit, 1000));
      if (error) throw error;
      result = data;
    } else if (path === 'emails') {
      if (!eventId) return jsonError('event_id required', 400);
      const { data, error } = await supabase.from('email_campaigns').select('*').eq('event_id', eventId);
      if (error) throw error;
      result = data;
    } else {
      return jsonError(`Unknown endpoint: ${path}. Available: events, guests, stats, zones, access-logs, emails`, 404);
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return jsonError(err.message, 500);
  }
});

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getStats(supabase: any, eventId: string) {
  const [guests, accessLogs, campaigns] = await Promise.all([
    supabase.from('guests').select('status, zone, email_status, checked_in_at').eq('event_id', eventId),
    supabase.from('access_logs').select('action, zone_name, created_at').eq('event_id', eventId),
    supabase.from('email_campaigns').select('sent_count, opened_count, failed_count').eq('event_id', eventId),
  ]);

  const guestData = guests.data || [];
  const total = guestData.length;
  const checkedIn = guestData.filter((g: any) => g.status === 'checked-in').length;
  const confirmed = guestData.filter((g: any) => g.status === 'confirmed').length;
  const declined = guestData.filter((g: any) => g.status === 'declined').length;

  const byZone: Record<string, { total: number; checkedIn: number }> = {};
  guestData.forEach((g: any) => {
    if (!byZone[g.zone]) byZone[g.zone] = { total: 0, checkedIn: 0 };
    byZone[g.zone].total++;
    if (g.status === 'checked-in') byZone[g.zone].checkedIn++;
  });

  const emailsSent = (campaigns.data || []).reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
  const emailsOpened = (campaigns.data || []).reduce((s: number, c: any) => s + (c.opened_count || 0), 0);
  const emailsFailed = (campaigns.data || []).reduce((s: number, c: any) => s + (c.failed_count || 0), 0);

  return {
    guests: { total, checkedIn, confirmed, declined, byZone },
    emails: { sent: emailsSent, opened: emailsOpened, failed: emailsFailed },
    accessLogs: { total: (accessLogs.data || []).length },
  };
}
