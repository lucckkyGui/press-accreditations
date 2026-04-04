import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: string[] = [];

  // 1. Fix guests: drop PERMISSIVE block, add RESTRICTIVE block for anon
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        DROP POLICY IF EXISTS "Block unauthenticated access to guests" ON public.guests;
        CREATE POLICY "Block anon access to guests"
          ON public.guests
          AS RESTRICTIVE
          FOR ALL
          TO anon
          USING (false)
          WITH CHECK (false);
      `
    });
    if (error) {
      // Try direct approach
      const resp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/exec_sql`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          },
          body: JSON.stringify({ sql: "SELECT 1" }),
        }
      );
      results.push(`guests: rpc failed (${error.message}), will use pg`);
    } else {
      results.push("guests: RESTRICTIVE anon block applied");
    }
  } catch (e) {
    results.push(`guests: ${e.message}`);
  }

  // Use the SQL endpoint via pg
  const pgUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!pgUrl) {
    return new Response(JSON.stringify({ error: "No DB URL", results }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Import postgres
  const { default: postgres } = await import("https://deno.land/x/postgresjs@v3.4.4/mod.js");
  const sql = postgres(pgUrl);

  try {
    // 1. Fix guests block policy
    await sql.unsafe(`
      DROP POLICY IF EXISTS "Block unauthenticated access to guests" ON public.guests;
      DROP POLICY IF EXISTS "Block anon access to guests" ON public.guests;
      CREATE POLICY "Block anon access to guests"
        ON public.guests
        AS RESTRICTIVE
        FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    `);
    results.push("guests: RESTRICTIVE anon block created");

    // 2. Fix user_roles: add RESTRICTIVE UPDATE and DELETE policies for non-admins
    await sql.unsafe(`
      DROP POLICY IF EXISTS "Block non-admin updates on user_roles" ON public.user_roles;
      CREATE POLICY "Block non-admin updates on user_roles"
        ON public.user_roles
        AS RESTRICTIVE
        FOR UPDATE
        TO authenticated
        USING (has_role(auth.uid(), 'admin'::app_role));

      DROP POLICY IF EXISTS "Block non-admin deletes on user_roles" ON public.user_roles;
      CREATE POLICY "Block non-admin deletes on user_roles"
        ON public.user_roles
        AS RESTRICTIVE
        FOR DELETE
        TO authenticated
        USING (has_role(auth.uid(), 'admin'::app_role));
    `);
    results.push("user_roles: RESTRICTIVE UPDATE/DELETE policies created");

    // 3. Fix document_submissions: replace PERMISSIVE with RESTRICTIVE
    await sql.unsafe(`
      DROP POLICY IF EXISTS "Block unauthenticated access to document_submissions" ON public.document_submissions;
      DROP POLICY IF EXISTS "Block anon access to document_submissions" ON public.document_submissions;
      CREATE POLICY "Block anon access to document_submissions"
        ON public.document_submissions
        AS RESTRICTIVE
        FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    `);
    results.push("document_submissions: RESTRICTIVE anon block created");

    // 4. Fix storage: add UPDATE policy for media_documents
    await sql.unsafe(`
      DROP POLICY IF EXISTS "Users can update their own media documents" ON storage.objects;
      CREATE POLICY "Users can update their own media documents"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (
          bucket_id = 'media_documents'
          AND (storage.foldername(name))[1] = auth.uid()::text
        )
        WITH CHECK (
          bucket_id = 'media_documents'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
    `);
    results.push("storage: UPDATE policy for media_documents created");

  } catch (e) {
    results.push(`pg error: ${e.message}`);
  } finally {
    await sql.end();
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
