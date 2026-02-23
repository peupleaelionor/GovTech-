import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError } from '@/lib/errors/app-error'

/**
 * GET /api/analytics/overview - Get comprehensive analytics overview
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
    const period = searchParams.get('period') || '30' // days
    const ministryId = searchParams.get('ministryId')

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get all projects
    const projectsWhere: any = {
      createdAt: { gte: startDate },
    }
    if (ministryId) projectsWhere.ministryId = ministryId

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      projectsByStatus,
      projectsByPriority,
      totalBudget,
      totalSpent,
      budgetByMinistry,
      projectsByMonth,
      kpiAchievementRate,
      recentActivities,
    ] = await Promise.all([
      // Total projects
      db.project.count({ where: projectsWhere }),
      
      // Active projects
      db.project.count({
        where: { ...projectsWhere, status: { in: ['PLANNED', 'IN_PROGRESS'] } },
      }),
      
      // Completed projects
      db.project.count({
        where: { ...projectsWhere, status: 'COMPLETED' },
      }),
      
      // Projects by status
      db.project.groupBy({
        by: ['status'],
        where: projectsWhere,
        _count: true,
      }),
      
      // Projects by priority
      db.project.groupBy({
        by: ['priority'],
        where: projectsWhere,
        _count: true,
      }),
      
      // Total budget
      db.project.aggregate({
        where: projectsWhere,
        _sum: { budget: true },
      }),
      
      // Total spent
      db.project.aggregate({
        where: projectsWhere,
        _sum: { spent: true },
      }),
      
      // Budget by ministry
      db.project.groupBy({
        by: ['ministryId'],
        where: projectsWhere,
        _sum: { budget: true, spent: true },
      }),
      
      // Projects created by month
      db.$queryRaw`
        SELECT 
          strftime('%Y-%m', createdAt) as month,
          COUNT(*) as count,
          SUM(budget) as totalBudget
        FROM Project
        WHERE createdAt >= ${startDate}
        ${ministryId ? db.$queryRaw`AND ministryId = ${ministryId}` : db.$queryRaw``}
        GROUP BY month
        ORDER BY month DESC
      `,
      
      // KPI achievement rate
      db.kPI.aggregate({
        where: {
          createdAt: { gte: startDate },
          ...(ministryId && { ministryId }),
        },
        _avg: {
          current: true,
          target: true,
        },
      }),
      
      // Recent activities (audit logs)
      db.auditLog.findMany({
        where: {
          createdAt: { gte: startDate },
          ...(ministryId && {
            user: {
              ministryId,
            },
          }),
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ])

    // Calculate KPI achievement rate
    const kpiAvg = kpiAchievementRate._avg
    const achievementRate = kpiAvg.current && kpiAvg.target
      ? (kpiAvg.current / kpiAvg.target) * 100
      : 0

    // Prepare budget by ministry with ministry names
    const ministryIds = budgetByMinistry.map((b: any) => b.ministryId)
    const ministries = await db.ministry.findMany({
      where: { id: { in: ministryIds } },
      select: { id: true, name: true, code: true },
    })
    
    const budgetByMinistryWithNames = budgetByMinistry.map((b: any) => ({
      ...b,
      ministry: ministries.find((m: any) => m.id === b.ministryId),
    }))

    const overview = {
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
        totalBudget: totalBudget._sum.budget || 0,
        totalSpent: totalSpent._sum.spent || 0,
        budgetUtilization: totalBudget._sum.budget
          ? ((totalSpent._sum.spent || 0) / totalBudget._sum.budget) * 100
          : 0,
        kpiAchievementRate: Math.round(achievementRate),
      },
      projects: {
        byStatus: projectsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count
          return acc
        }, {} as Record<string, number>),
        byPriority: projectsByPriority.reduce((acc, item) => {
          acc[item.priority] = item._count
          return acc
        }, {} as Record<string, number>),
        byMonth: projectsByMonth,
      },
      budget: {
        byMinistry: budgetByMinistryWithNames,
        totalAllocation: totalBudget._sum.budget || 0,
        totalExpenditure: totalSpent._sum.spent || 0,
      },
      activities: recentActivities,
      period: {
        days: daysAgo,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    }

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.DATA_ACCESS,
      entityType: 'ANALYTICS',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { period: daysAgo, ministryId },
    })

    return NextResponse.json({
      success: true,
      data: overview,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
