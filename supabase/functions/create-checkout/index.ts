import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { isAllowedStripePriceId, RequestError, requireAllowedRedirectOrigin } from "../_shared/stripeSecurity.ts";

const corsHeaders = buildCorsHeaders();

const RATE_LIMIT = { maxRequests: 10, windowMs: 60_000, keyPrefix: "create-checkout" };

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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    
    // Warn in logs if using test key in production
    if (stripeKey.startsWith("sk_test_")) {
      console.warn("[CREATE-CHECKOUT] ⚠️ Using Stripe TEST key. Switch to sk_live_ for production.");
    }

    const user = await getAuthenticatedUser(req);
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { priceId } = await req.json();
    if (!isAllowedStripePriceId(priceId)) {
      throw new RequestError(400, "Unsupported priceId");
    }

    const redirectOrigin = requireAllowedRedirectOrigin(req);

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${redirectOrigin}/dashboard?checkout=success`,
      cancel_url: `${redirectOrigin}/products?checkout=canceled`,
      subscription_data: {
        trial_period_days: 14,
      },
    });

    return jsonResponse({ url: session.url }, 200);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const status = error instanceof RequestError ? error.status : 500;
    return jsonResponse({ error: msg }, status);
  }
});
