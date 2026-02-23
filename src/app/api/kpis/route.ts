import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all KPIs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const ministryId = searchParams.get('ministryId')
    const year = searchParams.get('year')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    
    if (projectId) where.projectId = projectId
    if (ministryId) where.ministryId = ministryId
    if (year) where.year = parseInt(year)
    if (category) where.category = category

    const kpis = await db.kPI.findMany({
      where,
      take: limit,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { updatedAt: 'desc' }
      ],
      include: {
        project: { select: { name: true, code: true } },
        ministry: { select: { name: true } },
        owner: { select: { name: true } }
      }
    })

    // Calculate KPI statistics
    const totalKPIs = kpis.length
    const achievedKPIs = kpis.filter(k => k.current >= k.target).length
    const achievementRate = totalKPIs > 0 ? ((achievedKPIs / totalKPIs) * 100).toFixed(2) : 0

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        summary: {
          totalKPIs,
          achievedKPIs,
          achievementRate: parseFloat(achievementRate)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPIs' },
      { status: 500 }
    )
  }
}

// POST create new KPI
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      name,
      code,
      description,
      category,
      target,
      current,
      unit,
      frequency,
      projectId,
      ministryId,
      ownerId,
      year,
      month,
      trend
    } = body

    // Validate required fields
    if (!name || !code || !category || !target || !year) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const kpi = await db.kPI.create({
      data: {
        name,
        code,
        description,
        category,
        target: parseFloat(target),
        current: current ? parseFloat(current) : 0,
        unit,
        frequency,
        projectId,
        ministryId,
        ownerId,
        year: parseInt(year),
        month: month ? parseInt(month) : null,
        trend: trend || 'stable'
      },
      include: {
        project: { select: { name: true } },
        ministry: { select: { name: true } },
        owner: { select: { name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: kpi
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating KPI:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create KPI' },
      { status: 500 }
    )
  }
}
