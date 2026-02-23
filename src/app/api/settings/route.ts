import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError, ForbiddenError } from '@/lib/errors/app-error'
import { hasPermission } from '@/lib/auth/config'

/**
 * GET /api/settings - Get system settings (filtered by user role)
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

    const userId = (session.user as any).id
    const canViewAll = await hasPermission(userId, 'system:manage')

    const where: any = {}
    if (!canViewAll) {
      where.isPublic = true
    }

    const settings = await db.systemSetting.findMany({
      where,
      orderBy: { category: 'asc' },
    })

    // Group settings by category
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      // Hide value for non-public settings unless user has permission
      acc[setting.category].push({
        key: setting.key,
        value: canViewAll || setting.isPublic ? setting.value : '***',
        description: setting.description,
        isPublic: setting.isPublic,
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      data: grouped,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * PUT /api/settings - Update system settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const canManage = await hasPermission((session.user as any).id, 'system:manage')
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to modify system settings')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.WRITE)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const body = await request.json()
    const { settings } = body

    if (!Array.isArray(settings)) {
      throw new Error('Settings must be an array')
    }

    const updatedSettings = await Promise.all(
      settings.map(async (setting: any) => {
        const { key, value } = setting
        
        return db.systemSetting.upsert({
          where: { key },
          update: {
            value,
            updatedBy: (session.user as any).id,
          },
          create: {
            key,
            value,
            category: 'CUSTOM',
            updatedBy: (session.user as any).id,
          },
        })
      })
    )

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.SYSTEM_CONFIG_CHANGE,
      entityType: 'SYSTEM_SETTING',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { updatedKeys: settings.map((s: any) => s.key) },
    })

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully',
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
