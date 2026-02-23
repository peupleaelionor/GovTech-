import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError, ForbiddenError } from '@/lib/errors/app-error'
import { hasPermission } from '@/lib/auth/config'

/**
 * GET /api/workflows - List all workflows
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
    const entityType = searchParams.get('entityType')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (entityType) where.entityType = entityType
    if (isActive !== null) where.isActive = isActive === 'true'

    const workflows = await db.workflow.findMany({
      where,
      include: {
        _count: {
          select: {
            approvals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.DATA_ACCESS,
      entityType: 'WORKFLOW',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: workflows,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * POST /api/workflows - Create a new workflow
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const canManage = await hasPermission((session.user as any).id, 'system:manage')
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to create workflows')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.WRITE)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const body = await request.json()
    const { name, description, entityType, stages, isActive = true } = body

    if (!name || !entityType || !stages || !Array.isArray(stages)) {
      throw new Error('name, entityType, and stages (array) are required')
    }

    const workflow = await db.workflow.create({
      data: {
        name,
        description,
        entityType,
        stages: JSON.stringify(stages),
        isActive,
      },
    })

    await createAuditLog({
      userId: (session.user as any).id,
      action: 'WORKFLOW_CREATE',
      entityType: 'WORKFLOW',
      entityId: workflow.id,
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { workflowName: name, entityType },
    })

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow created successfully',
    }, {
      status: 201,
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
