import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { ProjectStatus, Priority } from '@prisma/client'
import { createProjectSchema, projectQuerySchema } from '@/lib/validation/schemas'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { 
  createAuditLog, 
  logDataModification, 
  AuditAction,
  logSecurityEvent 
} from '@/lib/security/audit-logger'
import { 
  ValidationError, 
  NotFoundError, 
  ForbiddenError,
  toAppError,
  formatErrorResponse 
} from '@/lib/errors/app-error'
import { hasPermission, getUserPermissions } from '@/lib/auth/config'

/**
 * GET /api/projects - List projects with filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new ForbiddenError('Authentication required')
    }

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.READ)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = projectQuerySchema.parse(queryParams)
    const { search, ministryId, departmentId, status, priority, managerId, limit, offset, sortBy, sortOrder } = validatedQuery

    // Build where clause based on user permissions
    const where: any = {}
    
    // Users can only see projects from their ministry unless they have global access
    const permissions = await getUserPermissions((session.user as any).id)
    const canViewAll = permissions.includes('projects:view_all')
    
    if (!canViewAll && (session.user as any).ministryId) {
      where.ministryId = (session.user as any).ministryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (ministryId) where.ministryId = ministryId
    if (departmentId) where.departmentId = departmentId
    if (status) where.status = status
    if (priority) where.priority = priority
    if (managerId) where.managerId = managerId

    // Get total count
    const total = await db.project.count({ where })

    // Get projects with pagination and sorting
    const orderBy: any = {}
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const projects = await db.project.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy,
      include: {
        ministry: { select: { name: true, code: true } },
        department: { select: { name: true } },
        manager: { select: { name: true, email: true } },
        budgets: {
          take: 1,
          orderBy: { year: 'desc' },
        },
        _count: {
          select: {
            kpis: true,
            reports: true,
            approvals: true,
          },
        },
      },
    })

    // Log data access
    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.DATA_ACCESS,
      entityType: 'PROJECT',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { accessType: 'LIST', filters: validatedQuery },
    })

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    
    // Log security events for unauthorized access
    if (appError.code === 'FORBIDDEN' || appError.code === 'UNAUTHORIZED') {
      await logSecurityEvent(
        null, // We don't have userId in case of auth failure
        AuditAction.UNAUTHORIZED_ACCESS,
        {
          ipAddress: getClientIP(request),
          userAgent: getUserAgent(request),
          metadata: { endpoint: '/api/projects', method: 'GET' },
        }
      )
    }

    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new ForbiddenError('Authentication required')
    }

    // Check permission
    const canCreate = await hasPermission((session.user as any).id, 'projects:create')
    if (!canCreate) {
      throw new ForbiddenError('You do not have permission to create projects')
    }

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.WRITE)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // Check if project code already exists in ministry
    const existingProject = await db.project.findFirst({
      where: {
        code: validatedData.code,
        ministryId: validatedData.ministryId,
      },
    })

    if (existingProject) {
      throw new ValidationError(
        `Project with code '${validatedData.code}' already exists in this ministry`,
        { field: 'code' }
      )
    }

    // Create project
    const project = await db.project.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        description: validatedData.description,
        status: validatedData.status || ProjectStatus.PLANNED,
        priority: validatedData.priority || Priority.MEDIUM,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        budget: validatedData.budget,
        ministryId: validatedData.ministryId,
        departmentId: validatedData.departmentId,
        managerId: validatedData.managerId,
        location: validatedData.location,
        requiresApproval: validatedData.requiresApproval || false,
      },
      include: {
        ministry: { select: { name: true, code: true } },
        department: { select: { name: true } },
        manager: { select: { name: true, email: true } },
      },
    })

    // Log creation
    await logDataModification(
      (session.user as any).id,
      AuditAction.PROJECT_CREATE,
      'PROJECT',
      project.id,
      undefined,
      { ...validatedData, id: project.id },
      getClientIP(request),
      getUserAgent(request)
    )

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully',
    }, {
      status: 201,
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    
    // Log security events
    if (appError.code === 'FORBIDDEN' || appError.code === 'UNAUTHORIZED') {
      await logSecurityEvent(
        (session?.user as any)?.id || null,
        AuditAction.UNAUTHORIZED_ACCESS,
        {
          ipAddress: getClientIP(request),
          userAgent: getUserAgent(request),
          metadata: { endpoint: '/api/projects', method: 'POST' },
        }
      )
    }

    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}
