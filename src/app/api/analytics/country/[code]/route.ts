import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError } from '@/lib/errors/app-error'
import { getCountryConfig, CountryCode } from '@/lib/i18n/config'

/**
 * GET /api/analytics/country/[code] - Get country-specific analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.READ)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const countryCode = params.code.toUpperCase() as CountryCode
    const countryConfig = getCountryConfig(countryCode)
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '90' // days
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get country-specific metrics
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      projectsByRegion,
      totalBudget,
      totalSpent,
      budgetByRegion,
      projectsBySector,
      employmentImpact,
      infrastructureProgress,
      socialIndicators,
    ] = await Promise.all([
      // Total projects
      db.project.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // Active projects
      db.project.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['PLANNED', 'IN_PROGRESS'] },
        },
      }),

      // Completed projects
      db.project.count({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED',
        },
      }),

      // Projects by region (simulated - in production, use actual region field)
      db.project.groupBy({
        by: ['ministryId'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
        _sum: { budget: true, spent: true },
      }),

      // Total budget
      db.project.aggregate({
        where: {
          createdAt: { gte: startDate },
        },
        _sum: { budget: true },
      }),

      // Total spent
      db.project.aggregate({
        where: {
          createdAt: { gte: startDate },
        },
        _sum: { spent: true },
      }),

      // Budget by ministry (as region proxy)
      db.project.groupBy({
        by: ['ministryId'],
        where: {
          createdAt: { gte: startDate },
        },
        _sum: { budget: true, spent: true },
      }),

      // Projects by sector (derived from ministry)
      db.project.groupBy({
        by: ['ministryId'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Employment impact (estimated)
      db.project.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['IN_PROGRESS', 'COMPLETED'] },
        },
        _sum: { budget: true },
      }),

      // Infrastructure progress
      db.project.findMany({
        where: {
          createdAt: { gte: startDate },
          description: {
            contains: 'infrastructur',
            mode: 'insensitive',
          },
        },
        take: 10,
        select: {
          id: true,
          name: true,
          progress: true,
          budget: true,
          spent: true,
          status: true,
        },
      }),

      // Social indicators (from KPIs)
      db.kPI.findMany({
        where: {
          year: parseInt(year),
          category: { in: ['Education', 'Santé', 'Infrastructure'] },
        },
        take: 20,
      }),
    ])

    // Calculate African-specific metrics
    const employmentEstimate = (employmentImpact._sum.budget || 0) * 0.0001 // 1 job per $10,000
    const jobsCreated = Math.floor(employmentEstimate)
    const jobsSustained = Math.floor(employmentEstimate * 2.5)

    // Infrastructure metrics
    const infrastructureProjects = infrastructureProgress.length
    const avgInfraProgress = infrastructureProgress.length > 0
      ? infrastructureProgress.reduce((sum, p) => sum + p.progress, 0) / infrastructureProgress.length
      : 0

    // Get ministry names for better display
    const ministryIds = [...new Set([
      ...projectsByRegion.map((p) => p.ministryId),
      ...budgetByRegion.map((p) => p.ministryId),
    ])]
    const ministries = await db.ministry.findMany({
      where: { id: { in: ministryIds } },
      select: { id: true, name: true, code: true },
    })

    // Enrich data with ministry names
    const projectsByRegionEnriched = projectsByRegion.map((p) => ({
      ...p,
      ministry: ministries.find((m) => m.id === p.ministryId),
    }))

    const budgetByRegionEnriched = budgetByRegion.map((b) => ({
      ...b,
      ministry: ministries.find((m) => m.id === b.ministryId),
    }))

    // African development indicators
    const developmentIndicators = {
      // Infrastructure Development Index (IDI)
      infrastructureIndex: Math.min(100, avgInfraProgress + (infrastructureProjects * 2)),
      
      // Budget Execution Rate
      budgetExecutionRate: totalBudget._sum.budget
        ? ((totalSpent._sum.spent || 0) / totalBudget._sum.budget) * 100
        : 0,
      
      // Project Completion Rate
      projectCompletionRate: totalProjects > 0
        ? (completedProjects / totalProjects) * 100
        : 0,
      
      // Employment Generation (jobs per $1M spent)
      employmentGeneration: totalSpent._sum.spent
        ? (jobsCreated / (totalSpent._sum.spent / 1000000)).toFixed(2)
        : '0',
      
      // Regional Development Score (RDS)
      regionalDevelopmentScore: 50 + (projectsByRegion.length * 5), // Base 50 + 5 per active ministry
    }

    // Social indicators by category
    const socialIndicatorsByCategory = socialIndicators.reduce((acc, kpi) => {
      if (!acc[kpi.category]) {
        acc[kpi.category] = []
      }
      acc[kpi.category].push({
        name: kpi.name,
        target: kpi.target,
        current: kpi.current,
        achievement: kpi.target > 0 ? (kpi.current / kpi.target) * 100 : 0,
      })
      return acc
    }, {} as Record<string, any[]>)

    const analytics = {
      country: {
        code: countryCode,
        name: countryConfig.name,
        currency: countryConfig.currency,
        currencySymbol: countryConfig.currencySymbol,
      },
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget: totalBudget._sum.budget || 0,
        totalSpent: totalSpent._sum.spent || 0,
        budgetUtilization: developmentIndicators.budgetExecutionRate,
        completionRate: developmentIndicators.projectCompletionRate,
      },
      regional: {
        projectsByRegion: projectsByRegionEnriched,
        budgetByRegion: budgetByRegionEnriched,
        regions: countryConfig.regions,
      },
      sectors: {
        projectsBySector: projectsBySector,
        sectors: ['Infrastructure', 'Education', 'Health', 'Agriculture', 'Energy', 'Technology'],
      },
      development: {
        indicators: developmentIndicators,
        infrastructureProgress,
        socialIndicators: socialIndicatorsByCategory,
      },
      impact: {
        jobsCreated,
        jobsSustained,
        infrastructureIndex: developmentIndicators.infrastructureIndex,
        regionalDevelopmentScore: Math.min(100, developmentIndicators.regionalDevelopmentScore),
      },
      period: {
        days: daysAgo,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        year,
      },
    }

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.DATA_ACCESS,
      entityType: 'COUNTRY_ANALYTICS',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { countryCode, period: daysAgo },
    })

    return NextResponse.json({
      success: true,
      data: analytics,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
