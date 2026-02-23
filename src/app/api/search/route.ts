import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError } from '@/lib/errors/app-error'

/**
 * POST /api/search - Advanced search across all entities
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    // Apply rate limiting (stricter for search)
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.SEARCH)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const body = await request.json()
    const { query, type = 'all', limit = 20, offset = 0 } = body

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters')
    }

    const searchTerm = query.trim()
    const results: any = {
      projects: [],
      reports: [],
      users: [],
      ministries: [],
      total: 0,
    }

    // Search Projects
    if (type === 'all' || type === 'projects') {
      const projects = await db.project.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { location: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: limit,
        skip: offset,
        include: {
          ministry: { select: { name: true, code: true } },
          manager: { select: { name: true } },
        },
      })
      results.projects = projects
      results.total += projects.length
    }

    // Search Reports
    if (type === 'all' || type === 'reports') {
      const reports = await db.report.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { summary: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: limit,
        skip: offset,
        include: {
          author: { select: { name: true, email: true } },
          ministry: { select: { name: true, code: true } },
        },
      })
      results.reports = reports
      results.total += reports.length
    }

    // Search Users
    if (type === 'all' || type === 'users') {
      const users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { position: { contains: searchTerm, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          position: true,
          ministry: { select: { name: true, code: true } },
          department: { select: { name: true } },
        },
      })
      results.users = users
      results.total += users.length
    }

    // Search Ministries
    if (type === 'all' || type === 'ministries') {
      const ministries = await db.ministry.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: {
              projects: true,
              users: true,
            },
          },
        },
      })
      results.ministries = ministries
      results.total += ministries.length
    }

    // Log search
    await createAuditLog({
      userId: (session.user as any).id,
      action: 'SEARCH',
      entityType: 'SEARCH',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { query: searchTerm, type, resultsCount: results.total },
    })

    return NextResponse.json({
      success: true,
      data: results,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * GET /api/search/suggestions - Get search suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: { suggestions: [] } })
    }

    const searchTerm = query.trim()
    const suggestions: string[] = new Set()

    // Get recent projects as suggestions
    const projects = await db.project.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { code: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { name: true, code: true },
    })

    projects.forEach(p => {
      suggestions.add(p.name)
      suggestions.add(p.code)
    })

    // Get recent users as suggestions
    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: 3,
      select: { name: true, email: true },
    })

    users.forEach(u => {
      suggestions.add(u.name)
    })

    return NextResponse.json({
      success: true,
      data: {
        suggestions: Array.from(suggestions).slice(0, 10),
      },
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
