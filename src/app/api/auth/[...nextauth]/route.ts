import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter'
import { logAuthAttempt } from '@/lib/security/audit-logger'

const handler = async (req: Request) => {
  // Apply rate limiting to auth endpoints
  const rateLimitResult = await checkRateLimit(req, RATE_LIMITS.AUTH)
  
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response
  }

  // Get IP and user agent for audit logging
  const ip = getClientIP(req)
  const userAgent = getUserAgent(req)

  // Handle the NextAuth request
  const response = await NextAuth(authOptions)(req)

  // Log auth attempts (this is a simplified version, in production you'd want more detailed logging)
  // Note: Actual logging would be done in NextAuth events, this is for failed attempts
  
  // Add rate limit headers to response
  if (rateLimitResult.headers && response instanceof Response) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

export { handler as GET, handler as POST }
