import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError } from '@/lib/errors/app-error'
import { getDiasporaStats, calculateDiasporaImpact, getEngagementOpportunities } from '@/lib/diaspora/management'

/**
 * GET /api/diaspora - Get diaspora statistics and impact
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.READ)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country') || 'CM'

    // Get diaspora stats
    const stats = getDiasporaStats(countryCode)

    if (!stats) {
      return NextResponse.json({
        success: false,
        error: 'Diaspora data not available for this country',
      }, { status: 404 })
    }

    // Calculate economic impact
    const impact = calculateDiasporaImpact(countryCode)

    // Get engagement opportunities
    const opportunities = getEngagementOpportunities(countryCode)

    const data = {
      stats,
      impact,
      opportunities,
      recommendations: [
        'Establish dedicated diaspora investment fund',
        'Create diaspora-friendly business regulations',
        'Develop diaspora talent exchange programs',
        'Establish diaspora advisory councils',
        'Implement tax incentives for diaspora investments',
        'Create diaspora information portals',
      ],
    }

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.DATA_ACCESS,
      entityType: 'DIASPORA',
      success: true,
      ipAddress: getClientIP(request),
      metadata: { countryCode },
    })

    return NextResponse.json({
      success: true,
      data,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
