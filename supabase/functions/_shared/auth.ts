import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase auth environment is not configured");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

export async function hasAllowedRole(
  supabaseAdmin: any,
  userId: string,
  allowedRoles: readonly string[],
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", [...allowedRoles]);

  if (error) {
    console.error("Role lookup failed:", error.message);
    return false;
  }

  return Boolean(data?.length);
}
