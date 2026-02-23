import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError } from '@/lib/errors/app-error'
import { getBudgetOptimization, calculateDebtSustainability, getEfficiencyRecommendations } from '@/lib/budget/optimization'

/**
 * GET /api/budget-optimization - Get budget optimization data
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
    const include = searchParams.getAll('include')

    const optimization = getBudgetOptimization(countryCode)

    if (!optimization) {
      return NextResponse.json({
        success: false,
        error: 'Budget optimization data not available for this country',
      }, { status: 404 })
    }

    const data: any = { optimization }

    // Include additional data if requested
    if (include.includes('debt-sustainability')) {
      data.debtSustainability = calculateDebtSustainability(countryCode)
    }

    if (include.includes('efficiency-recommendations')) {
      data.efficiencyRecommendations = getEfficiencyRecommendations(countryCode)
    }

    if (include.includes('all') || include.includes('both')) {
      data.debtSustainability = calculateDebtSustainability(countryCode)
      data.efficiencyRecommendations = getEfficiencyRecommendations(countryCode)
    }

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.DATA_ACCESS,
      entityType: 'BUDGET_OPTIMIZATION',
      success: true,
      ipAddress: getClientIP(request),
      metadata: { countryCode, include },
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
