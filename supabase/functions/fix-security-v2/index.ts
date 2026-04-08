import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { ssl: { rejectUnauthorized: false } });
  const results: string[] = [];

  try {
    // 1. Fix SECURITY DEFINER view - recreate as SECURITY INVOKER
    await sql`DROP VIEW IF EXISTS public.public_events`;
    await sql`
      CREATE VIEW public.public_events 
      WITH (security_invoker = true) AS
      SELECT id, title, description, start_date, end_date, location, 
             category, image_url, is_published, max_guests, status,
             created_at, updated_at
      FROM public.events
      WHERE is_published = true
    `;
    await sql`GRANT SELECT ON public.public_events TO anon`;
    await sql`GRANT SELECT ON public.public_events TO authenticated`;
    results.push('Recreated public_events view with SECURITY INVOKER');

    // We need a public SELECT policy on events for the view to work (since INVOKER uses caller's privileges)
    // Add a policy that allows anon to SELECT published events but only non-sensitive columns via the view
    // Actually with SECURITY INVOKER + anon role, we need a policy on events for anon
    await sql`
      CREATE POLICY "Anon can read published events" ON public.events
      FOR SELECT TO anon
      USING (is_published = true)
    `;
    results.push('Added anon SELECT policy for published events (view uses SECURITY INVOKER)');

    // 2. Add face_photos UPDATE storage policy
    const existing = await sql`
      SELECT policyname FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'face_photos_update'
    `;
    if (existing.length === 0) {
      await sql`
        CREATE POLICY "face_photos_update" ON storage.objects
        FOR UPDATE TO authenticated
        USING (bucket_id = 'face_photos' AND (storage.foldername(name))[1] = auth.uid()::text)
        WITH CHECK (bucket_id = 'face_photos' AND (storage.foldername(name))[1] = auth.uid()::text)
      `;
      results.push('Added face_photos UPDATE storage policy');
    }

    await sql.end();
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    await sql.end();
    return new Response(JSON.stringify({ error: err.message, results }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
