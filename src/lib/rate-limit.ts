/**
 * Minimal fixed-window rate limiter, held in memory.
 *
 * LIMITATION — read before relying on this: the counters live in the process,
 * so they reset on redeploy and are not shared between instances. On a single
 * long-lived Node server (how this app is deployed today) that is fine. If this
 * ever runs serverless or behind more than one instance, move the counters to
 * Redis or Mongo — otherwise the effective limit multiplies by the instance
 * count.
 *
 * It exists to blunt casual contact-form spam, not to stop a determined
 * attacker. The honeypot field is the other half of that defence.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Keep the map from growing without bound on a long-running process.
const MAX_TRACKED_KEYS = 10_000

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k)
      }
      // Still full of live buckets — drop the oldest rather than grow forever.
      if (buckets.size >= MAX_TRACKED_KEYS) {
        const oldest = buckets.keys().next().value
        if (oldest !== undefined) buckets.delete(oldest)
      }
    }

    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  bucket.count++
  return {
    allowed: true,
    remaining: limit - bucket.count,
    retryAfterSeconds: 0,
  }
}

/**
 * Best-effort client IP.
 *
 * Trusting x-forwarded-for is only safe behind a proxy that overwrites it —
 * a direct client can set any value. Rate limiting is the only consumer here,
 * so a spoofed value costs an attacker their own bucket, nothing more. Never
 * use this for authorization.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]!.trim()
  return headers.get("x-real-ip")?.trim() || "unknown"
}
