import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Routes that don't require authentication
 */
const publicRoutes = [
  '/',
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
 * Note: Runs in Vercel Edge Runtime - no database/Prisma access
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  )

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
