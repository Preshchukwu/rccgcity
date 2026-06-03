import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimit: Ratelimit | null = null

function getRatelimit() {
  if (ratelimit) return ratelimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'rccgcity',
  })

  return ratelimit
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const limiter = getRatelimit()

  // No Redis configured — allow all requests in dev
  if (!limiter) return { success: true, remaining: 99 }

  const result = await limiter.limit(identifier)
  return { success: result.success, remaining: result.remaining }
}
