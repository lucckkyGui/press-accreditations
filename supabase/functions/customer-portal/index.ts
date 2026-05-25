import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { RequestError, requireAllowedRedirectOrigin } from "../_shared/stripeSecurity.ts";

const corsHeaders = buildCorsHeaders();

const RATE_LIMIT = { maxRequests: 10, windowMs: 60_000, keyPrefix: "customer-portal" };

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rl = checkRateLimit(getClientIP(req), RATE_LIMIT);
  if (!rl.allowed) return createRateLimitResponse(rl, corsHeaders);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const user = await getAuthenticatedUser(req);
    if (!user?.email) throw new Error("User not authenticated or email not available");
    const redirectOrigin = requireAllowedRedirectOrigin(req);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) throw new Error("No Stripe customer found for this user");

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${redirectOrigin}/dashboard`,
    });

    return jsonResponse({ url: portalSession.url }, 200);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const status = error instanceof RequestError ? error.status : 500;
    return jsonResponse({ error: msg }, status);
  }
});
