const DEFAULT_ALLOWED_HEADERS = [
  "authorization",
  "x-client-info",
  "apikey",
  "content-type",
  "x-api-key",
  "x-supabase-client-platform",
  "x-supabase-client-platform-version",
  "x-supabase-client-runtime",
  "x-supabase-client-runtime-version",
].join(", ");

const LOCAL_DEV_ORIGIN = "http://localhost:8080";

function getConfiguredOrigin(): string {
  const allowedOrigins = Deno.env
    .get("ALLOWED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins?.length) {
    return allowedOrigins[0];
  }

  return Deno.env.get("PUBLIC_APP_URL") || LOCAL_DEV_ORIGIN;
}

export function buildCorsHeaders(allowedHeaders = DEFAULT_ALLOWED_HEADERS): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": getConfiguredOrigin(),
    "Access-Control-Allow-Headers": allowedHeaders,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Vary": "Origin",
  };
}
