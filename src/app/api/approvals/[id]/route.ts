import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/errors/app-error'
import { ApprovalStatus, ProjectStatus } from '@prisma/client'

/**
 * PATCH /api/approvals/[id] - Approve or reject an approval
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.WRITE)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const approvalId = params.id
    const body = await request.json()
    const { action, comments } = body

    if (action !== 'approve' && action !== 'reject') {
      throw new Error('Action must be either "approve" or "reject"')
    }

    // Get approval
    const approval = await db.approval.findUnique({
      where: { id: approvalId },
      include: {
        workflow: true,
        requester: true,
        approver: true,
      },
    })

    if (!approval) {
      throw new NotFoundError('Approval', approvalId)
    }

    // Check if user is the approver
    if (approval.approverId !== (session.user as any).id) {
      throw new ForbiddenError('You are not authorized to approve this request')
    }

    // Check if approval is still pending
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new Error(`Approval is already ${approval.status.toLowerCase()}`)
    }

    // Update approval
    const now = new Date()
    const updateData: any = {
      status: action === 'approve' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
      comments: comments || approval.comments,
    }

    if (action === 'approve') {
      updateData.approvedAt = now
    } else {
      updateData.rejectedAt = now
    }

    const updatedApproval = await db.approval.update({
      where: { id: approvalId },
      data: updateData,
      include: {
        workflow: true,
        requester: true,
        approver: true,
      },
    })

    // Update entity status based on approval
    if (approval.entityType === 'PROJECT') {
      const newStatus = action === 'approve' ? ProjectStatus.IN_PROGRESS : ProjectStatus.PLANNED
      await db.project.update({
        where: { id: approval.entityId },
        data: { status: newStatus },
      })
    }

    // Create notification for requester
    await db.notification.create({
      data: {
        userId: approval.requesterId,
        type: action === 'approve' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
        title: `Approval ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your request for ${approval.entityType} (${approval.entityId}) has been ${action === 'approve' ? 'approved' : 'rejected'} by ${approval.approver.name}.`,
        metadata: JSON.stringify({ approvalId, entityType: approval.entityType, entityId: approval.entityId, action }),
      },
    })

    await createAuditLog({
      userId: (session.user as any).id,
      action: action === 'approve' ? AuditAction.APPROVAL_GRANTED : AuditAction.APPROVAL_REJECTED,
      entityType: 'APPROVAL',
      entityId: approvalId,
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: {
        originalStatus: approval.status,
        newStatus: updatedApproval.status,
        entityType: approval.entityType,
        entityId: approval.entityId,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApproval,
      message: `Approval ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * GET /api/approvals/[id] - Get approval details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const approval = await db.approval.findUnique({
      where: { id: params.id },
      include: {
        workflow: true,
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

    if (!approval) {
      throw new NotFoundError('Approval', params.id)
    }

    return NextResponse.json({
      success: true,
      data: approval,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
