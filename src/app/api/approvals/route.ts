import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/errors/app-error'
import { hasPermission } from '@/lib/auth/config'
import { ApprovalStatus } from '@prisma/client'

/**
 * GET /api/approvals - List approvals with filtering
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
    const status = searchParams.get('status')
    const requesterId = searchParams.get('requesterId')
    const approverId = searchParams.get('approverId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    // Filter based on user role and permissions
    const permissions = await hasPermission((session.user as any).id, 'approvals:view_all')
    const userId = (session.user as any).id

    if (!permissions) {
      // Users can see approvals they requested or need to approve
      where.OR = [
        { requesterId: userId },
        { approverId: userId },
      ]
    }

    if (entityType) where.entityType = entityType
    if (status) where.status = status
    if (requesterId) where.requesterId = requesterId
    if (approverId) where.approverId = approverId

    const total = await db.approval.count({ where })

    const approvals = await db.approval.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        workflow: {
          select: {
            name: true,
            entityType: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    await createAuditLog({
      userId,
      action: AuditAction.DATA_ACCESS,
      entityType: 'APPROVAL',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: {
        approvals,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      },
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * POST /api/approvals - Create an approval request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.WRITE)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const body = await request.json()
    const { workflowId, entityType, entityId, currentStage, comments } = body

    if (!workflowId || !entityType || !entityId || !currentStage) {
      throw new Error('workflowId, entityType, entityId, and currentStage are required')
    }

    // Verify workflow exists
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow) {
      throw new NotFoundError('Workflow', workflowId)
    }

    // Get workflow stages to determine approver
    const stages = JSON.parse(workflow.stages)
    const stageConfig = stages.find((s: any) => s.name === currentStage)

    if (!stageConfig || !stageConfig.approvers) {
      throw new Error('Invalid stage or no approvers configured')
    }

    // For now, assign to first approver (in production, this would be more sophisticated)
    const approverId = stageConfig.approvers[0]

    const approval = await db.approval.create({
      data: {
        workflowId,
        entityType,
        entityId,
        currentStage,
        status: ApprovalStatus.PENDING,
        requesterId: (session.user as any).id,
        approverId,
        comments,
      },
      include: {
        workflow: {
          select: {
            name: true,
            entityType: true,
          },
        },
        requester: {
          select: {
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Create notification for approver
    await db.notification.create({
      data: {
        userId: approverId,
        type: 'APPROVAL_REQUEST',
        title: `New Approval Request: ${workflow.name}`,
        message: `${(session.user as any).name} has requested approval for ${entityType} (${entityId}). ${comments ? `Comments: ${comments}` : ''}`,
        metadata: JSON.stringify({ approvalId: approval.id, entityType, entityId }),
      },
    })

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.APPROVAL_REQUEST,
      entityType: 'APPROVAL',
      entityId: approval.id,
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { workflowId, entityType, entityId, currentStage },
    })

    // Update entity to show it requires approval
    if (entityType === 'PROJECT') {
      await db.project.update({
        where: { id: entityId },
        data: { status: 'PENDING_APPROVAL' },
      })
    }

    return NextResponse.json({
      success: true,
      data: approval,
      message: 'Approval request created successfully',
    }, {
      status: 201,
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
