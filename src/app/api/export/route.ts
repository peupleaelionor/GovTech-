import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError, ForbiddenError } from '@/lib/errors/app-error'
import { hasPermission } from '@/lib/auth/config'

/**
 * POST /api/export - Export data in various formats
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    // Check permission
    const canExport = await hasPermission((session.user as any).id, 'data:export')
    if (!canExport) {
      throw new ForbiddenError('You do not have permission to export data')
    }

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.UPLOAD)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const body = await request.json()
    const { type, format = 'json', filters = {} } = body

    if (!type) {
      throw new Error('Export type is required')
    }

    let data: any = []
    let filename = `export-${type}-${Date.now()}`

    // Export Projects
    if (type === 'projects') {
      const projects = await db.project.findMany({
        where: filters.ministryId ? { ministryId: filters.ministryId } : {},
        include: {
          ministry: { select: { name: true, code: true } },
          department: { select: { name: true } },
          manager: { select: { name: true, email: true } },
          budgets: true,
          kpis: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      data = projects
    }
    // Export Reports
    else if (type === 'reports') {
      const reports = await db.report.findMany({
        where: filters.ministryId ? { ministryId: filters.ministryId } : {},
        include: {
          author: { select: { name: true, email: true } },
          ministry: { select: { name: true, code: true } },
          project: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      data = reports
    }
    // Export Users
    else if (type === 'users') {
      const users = await db.user.findMany({
        where: {
          ...(filters.ministryId && { ministryId: filters.ministryId }),
          ...(filters.departmentId && { departmentId: filters.departmentId }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          position: true,
          ministry: { select: { name: true, code: true } },
          department: { select: { name: true } },
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      data = users
    }
    // Export Budgets
    else if (type === 'budgets') {
      const budgets = await db.budget.findMany({
        include: {
          project: {
            include: {
              ministry: { select: { name: true, code: true } },
            },
          },
        },
        orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
      })
      data = budgets
    }
    // Export KPIs
    else if (type === 'kpis') {
      const kpis = await db.kPI.findMany({
        include: {
          project: { select: { name: true, code: true } },
          ministry: { select: { name: true, code: true } },
          owner: { select: { name: true } },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      })
      data = kpis
    }
    // Export Ministries
    else if (type === 'ministries') {
      const ministries = await db.ministry.findMany({
        include: {
          _count: {
            select: {
              projects: true,
              users: true,
              departments: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      })
      data = ministries
    }
    // Export Audit Logs (admin only)
    else if (type === 'audit-logs') {
      const canViewAuditLogs = await hasPermission((session.user as any).id, 'audit:view')
      if (!canViewAuditLogs) {
        throw new ForbiddenError('You do not have permission to export audit logs')
      }

      const auditLogs = await db.auditLog.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limit export size
      })
      data = auditLogs
    } else {
      throw new Error(`Unknown export type: ${type}`)
    }

    // Format data based on requested format
    let content: string
    let contentType: string

    if (format === 'csv') {
      content = convertToCSV(data)
      contentType = 'text/csv'
      filename = `${filename}.csv`
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2)
      contentType = 'application/json'
      filename = `${filename}.json`
    } else {
      throw new Error(`Unsupported format: ${format}`)
    }

    // Log export
    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.EXPORT_DATA,
      entityType: 'EXPORT',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { type, format, recordCount: Array.isArray(data) ? data.length : 1 },
    })

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        ...rateLimitResult.headers,
      },
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * Convert array of objects to CSV format
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return ''
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Build CSV
  const rows = data.map(obj => {
    return headers.map(header => {
      const value = obj[header]
      
      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).replace(/"/g, '""')
      }
      
      // Handle strings with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      
      return value ?? ''
    }).join(',')
  })

  // Add header row
  const csv = [headers.join(','), ...rows].join('\n')
  
  return csv
}

/**
 * GET /api/export/templates - Get available export templates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const templates = [
      {
        id: 'projects-full',
        name: 'All Projects',
        type: 'projects',
        description: 'Complete project data with budgets and KPIs',
        formats: ['json', 'csv'],
      },
      {
        id: 'reports-full',
        name: 'All Reports',
        type: 'reports',
        description: 'All reports with author and ministry information',
        formats: ['json', 'csv'],
      },
      {
        id: 'budgets-by-year',
        name: 'Budgets by Year',
        type: 'budgets',
        description: 'Budget allocations and spending by year',
        formats: ['json', 'csv'],
      },
      {
        id: 'users-active',
        name: 'Active Users',
        type: 'users',
        description: 'List of all active users with roles',
        formats: ['json', 'csv'],
      },
      {
        id: 'kpis-current',
        name: 'Current KPIs',
        type: 'kpis',
        description: 'Most recent KPI values',
        formats: ['json', 'csv'],
      },
      {
        id: 'ministries-overview',
        name: 'Ministries Overview',
        type: 'ministries',
        description: 'Summary of all ministries with counts',
        formats: ['json', 'csv'],
      },
      {
        id: 'audit-logs-recent',
        name: 'Recent Audit Logs',
        type: 'audit-logs',
        description: 'Last 1000 audit log entries (admin only)',
        formats: ['json', 'csv'],
        adminOnly: true,
      },
    ]

    return NextResponse.json({
      success: true,
      data: templates,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
