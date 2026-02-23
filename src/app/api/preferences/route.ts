import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError } from '@/lib/errors/app-error'

/**
 * GET /api/preferences - Get user preferences
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

    // Get notification preferences
    const notificationPrefs = await db.notificationPreference.findMany({
      where: { userId },
    })

    // Build preferences object
    const preferences = {
      notifications: notificationPrefs.reduce((acc, pref) => {
        acc[pref.category] = acc[pref.category] || {}
        acc[pref.category][pref.type] = {
          enabled: pref.enabled,
          frequency: pref.frequency,
        }
        return acc
      }, {} as Record<string, any>),
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * PUT /api/preferences - Update user preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.WRITE)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { notifications } = body

    // Update notification preferences
    if (notifications) {
      for (const [category, types] of Object.entries(notifications)) {
        for (const [type, config] of Object.entries(types as any)) {
          await db.notificationPreference.upsert({
            where: {
              userId_type_category: {
                userId,
                type,
                category,
              },
            },
            update: {
              enabled: config.enabled,
              frequency: config.frequency,
            },
            create: {
              userId,
              type,
              category,
              enabled: config.enabled,
              frequency: config.frequency,
            },
          })
        }
      }
    }

    await createAuditLog({
      userId,
      action: 'PREFERENCES_UPDATE',
      entityType: 'USER_PREFERENCES',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { updatedPreferences: Object.keys(body) },
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
