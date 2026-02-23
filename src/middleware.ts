import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/security/rate-limiter'
import { logSecurityEvent } from '@/lib/security/audit-logger'
import { AuditAction } from '@/lib/security/audit-logger'

/**
 * Routes that don't require authentication
 */
const publicRoutes = [
  '/auth/signin',
  '/auth/error',
  '/api/auth',
  '/api/seed',
]

/**
 * Routes that require admin role
 */
const adminRoutes = [
  '/admin',
  '/api/admin',
]

/**
 * Routes that require super admin role
 */
const superAdminRoutes = [
  '/api/system',
]

/**
 * Middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip rate limiting for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = getClientIP(request)

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // Skip rate limiting for auth routes (handled separately)
    if (!pathname.startsWith('/api/auth')) {
      const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.API)
      
      if (!rateLimitResult.allowed) {
        // Log rate limit exceeded
        const token = await getToken({ req: request })
        if (token) {
          await logSecurityEvent(
            token.sub as string,
            AuditAction.RATE_LIMIT_EXCEEDED,
            {
              ipAddress: ip,
              userAgent: request.headers.get('user-agent') || undefined,
              metadata: { path: pathname },
            }
          )
        }
        
        return rateLimitResult.response!
      }
    }
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect to signin if no token
  if (!token) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Check admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    const userRole = token.role as string
    
    if (
      userRole !== 'SUPER_ADMIN' &&
      userRole !== 'ADMIN' &&
      userRole !== 'PRESIDENT' &&
      userRole !== 'PRIME_MINISTER'
    ) {
      // Log unauthorized access attempt
      await logSecurityEvent(
        token.sub as string,
        AuditAction.UNAUTHORIZED_ACCESS,
        {
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || undefined,
          metadata: { path: pathname, requiredRole: 'ADMIN' },
        }
      )

      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  // Check super admin routes
  if (superAdminRoutes.some(route => pathname.startsWith(route))) {
    const userRole = token.role as string
    
    if (userRole !== 'SUPER_ADMIN') {
      // Log unauthorized access attempt
      await logSecurityEvent(
        token.sub as string,
        AuditAction.UNAUTHORIZED_ACCESS,
        {
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || undefined,
          metadata: { path: pathname, requiredRole: 'SUPER_ADMIN' },
        }
      )

      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
