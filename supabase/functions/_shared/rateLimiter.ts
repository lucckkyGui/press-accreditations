// Simple in-memory rate limiter for edge functions
// Note: This resets on function cold starts, but provides basic protection

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;      // Maximum requests allowed
  windowMs: number;         // Time window in milliseconds
  keyPrefix?: string;       // Optional prefix for the key
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;          // Seconds until reset
}

/**
 * Check if a request is allowed based on rate limiting rules
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowMs, keyPrefix = '' } = config;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();

  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(key);

  // No existing entry or entry has expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }

  // Entry exists and is still valid
  const remaining = maxRequests - entry.count - 1;
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, remaining),
    resetIn,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(req: Request): string {
  // Check common headers for real IP (behind proxies/load balancers)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

/**
 * Create rate limit error response
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${result.resetIn} seconds.`,
      retryAfter: result.resetIn,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.resetIn),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.resetIn),
        ...corsHeaders,
      },
    }
  );
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult,
  maxRequests: number
): void {
  headers.set('X-RateLimit-Limit', String(maxRequests));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(result.resetIn));
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}
