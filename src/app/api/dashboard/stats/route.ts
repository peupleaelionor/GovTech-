import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total projects count
    const totalProjects = await db.project.count({
      where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } }
    })

    // Get total budget allocation
    const projects = await db.project.findMany({
      select: { budget: true, spent: true }
    })

    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    // Get active alerts
    const activeAlerts = await db.alert.count({
      where: { 
        isRead: false,
        isResolved: false,
        expiresAt: { gte: new Date() }
      }
    })

    // Get ministry count
    const ministriesCount = await db.ministry.count({
      where: { isActive: true }
    })

    // Get projects by status
    const projectsByStatus = await db.project.groupBy({
      by: ['status'],
      _count: true
    })

    // Get recent projects
    const recentProjects = await db.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        ministry: { select: { name: true, code: true } },
        manager: { select: { name: true } }
      }
    })

    // Get KPI summary
    const kpis = await db.kPI.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        ministry: { select: { name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProjects,
          budgetUtilization: Math.round(budgetUtilization),
          activeAlerts,
          totalBudget,
          totalSpent,
          ministriesCount
        },
        projectsByStatus: projectsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count
          return acc
        }, {} as Record<string, number>),
        recentProjects,
        kpis: kpis.map(kpi => ({
          id: kpi.id,
          name: kpi.name,
          code: kpi.code,
          target: kpi.current,
          current: kpi.current,
          unit: kpi.unit,
          trend: kpi.trend,
          ministry: kpi.ministry?.name
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
