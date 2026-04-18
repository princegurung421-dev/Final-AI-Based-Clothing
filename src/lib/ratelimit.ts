import { NextResponse } from "next/server"

/**
 * In-memory sliding-window rate limiter.
 *
 * Scope: per Vercel serverless instance. Good enough to block casual abuse
 * and accidental client retries; not a substitute for Upstash/Redis-backed
 * global limits if you're serious about scraping defence. For this app
 * (single public URL, low traffic), this is fine and costs nothing.
 *
 * Keying: (namespace, IP). We look at x-forwarded-for first (Vercel sets it),
 * fall back to x-real-ip, then "unknown" (all unknowns share one bucket —
 * in practice means "block one attacker trying to hide their IP").
 */

type Bucket = { count: number; windowStart: number }
const buckets = new Map<string, Bucket>()
const MAX_KEYS = 10_000 // prevent unbounded memory growth

export type RateLimitOpts = {
  namespace: string
  limit: number
  windowMs: number
}

function keyFor(req: Request, namespace: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  return `${namespace}:${ip}`
}

/** Returns null when the request is within limit, or a NextResponse 429 otherwise. */
export function rateLimit(req: Request, opts: RateLimitOpts): NextResponse | null {
  const key = keyFor(req, opts.namespace)
  const now = Date.now()

  if (buckets.size > MAX_KEYS) {
    // crude LRU-ish eviction: nuke everything older than 10× window
    const cutoff = now - opts.windowMs * 10
    for (const [k, v] of buckets) {
      if (v.windowStart < cutoff) buckets.delete(k)
    }
  }

  const existing = buckets.get(key)
  if (!existing || now - existing.windowStart > opts.windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return null
  }

  if (existing.count >= opts.limit) {
    const retryAfter = Math.max(
      1,
      Math.ceil((opts.windowMs - (now - existing.windowStart)) / 1000)
    )
    return NextResponse.json(
      { error: `Too many requests. Try again in ${retryAfter}s.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(opts.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    )
  }

  existing.count += 1
  return null
}
