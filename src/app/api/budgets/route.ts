import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all budgets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const year = searchParams.get('year')

    const where: any = {}
    
    if (projectId) where.projectId = projectId
    if (year) where.year = parseInt(year)

    const budgets = await db.budget.findMany({
      where,
      include: {
        project: {
          select: {
            name: true,
            code: true,
            ministry: { select: { name: true } }
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' }
      ]
    })

    // Calculate summary statistics
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

    return NextResponse.json({
      success: true,
      data: {
        budgets,
        summary: {
          totalAllocated,
          totalSpent,
          utilization: totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(2) : 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

// POST create new budget
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      projectId,
      category,
      allocated,
      year,
      quarter,
      description
    } = body

    // Validate required fields
    if (!projectId || !category || !allocated || !year) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const budget = await db.budget.create({
      data: {
        projectId,
        category,
        allocated: parseFloat(allocated),
        spent: 0,
        year: parseInt(year),
        quarter: quarter ? parseInt(quarter) : null,
        description
      },
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: budget
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create budget' },
      { status: 500 }
    )
  }
}
