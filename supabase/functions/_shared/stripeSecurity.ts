export class RequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const ALLOWED_STRIPE_PRICE_IDS = new Set([
  // Keep in sync with STRIPE_TIERS in src/config/stripe.ts.
  "price_1T58QBL2xYSV1Z3ieSDjku4F",
  "price_1T58QgL2xYSV1Z3iu2TrD5oT",
  "price_1T58R4L2xYSV1Z3i0zx7edFf",
]);

function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedRedirectOrigins() {
  const configuredOrigins = [
    Deno.env.get("PUBLIC_APP_URL"),
    ...(Deno.env.get("ALLOWED_ORIGINS")?.split(",") ?? []),
  ];

  return new Set(
    configuredOrigins
      .map((origin) => normalizeOrigin(origin?.trim()))
      .filter((origin): origin is string => Boolean(origin)),
  );
}

export function requireAllowedRedirectOrigin(req: Request) {
  const requestOrigin = normalizeOrigin(req.headers.get("origin"));
  if (!requestOrigin) {
    throw new RequestError(403, "Origin is required");
  }

  const allowedOrigins = getAllowedRedirectOrigins();
  if (allowedOrigins.size === 0) {
    throw new RequestError(500, "Application redirect origins are not configured");
  }

  if (!allowedOrigins.has(requestOrigin)) {
    throw new RequestError(403, "Origin is not allowed");
  }

  return requestOrigin;
}

export function isAllowedStripePriceId(priceId: unknown): priceId is string {
  return typeof priceId === "string" && ALLOWED_STRIPE_PRICE_IDS.has(priceId);
}
