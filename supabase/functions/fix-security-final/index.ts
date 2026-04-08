import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const dbUrl = Deno.env.get('SUPABASE_DB_URL')!;
  const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false } });

  const results: string[] = [];

  try {
    // 1. Fix events public exposure: create a view that excludes organizer_id
    // Instead, restrict the public policy to only non-sensitive columns via a secure view
    // Actually, the simplest fix: drop the public SELECT policy and create one that doesn't expose organizer_id
    // But RLS is row-level not column-level. Best approach: use a view.
    
    // Create a public_events view without organizer_id
    await sql`
      CREATE OR REPLACE VIEW public.public_events AS
      SELECT id, title, description, start_date, end_date, location, 
             category, image_url, is_published, max_guests, status,
             created_at, updated_at
      FROM public.events
      WHERE is_published = true
    `;
    results.push('Created public_events view without organizer_id');

    // Revoke direct access for anon on events table and grant on view
    await sql`
      DROP POLICY IF EXISTS "Published events are publicly visible" ON public.events
    `;
    results.push('Dropped public SELECT policy on events');

    // Grant select on view to anon
    await sql`GRANT SELECT ON public.public_events TO anon`;
    results.push('Granted anon SELECT on public_events view');

    // 2. Add storage policies for face_photos bucket
    // First check if policies exist
    const existingPolicies = await sql`
      SELECT policyname FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname LIKE '%face_photos%'
    `;
    
    if (existingPolicies.length === 0) {
      await sql`
        CREATE POLICY "face_photos_insert" ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'face_photos' AND (storage.foldername(name))[1] = auth.uid()::text)
      `;
      await sql`
        CREATE POLICY "face_photos_select" ON storage.objects
        FOR SELECT TO authenticated
        USING (bucket_id = 'face_photos' AND (storage.foldername(name))[1] = auth.uid()::text)
      `;
      await sql`
        CREATE POLICY "face_photos_delete" ON storage.objects
        FOR DELETE TO authenticated
        USING (bucket_id = 'face_photos' AND (storage.foldername(name))[1] = auth.uid()::text)
      `;
      results.push('Created face_photos storage policies (INSERT/SELECT/DELETE)');
    } else {
      results.push('face_photos storage policies already exist');
    }

    await sql.end();

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    await sql.end();
    return new Response(JSON.stringify({ error: err.message, results }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
