import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { signUpSchema, updateUserSchema } from '@/lib/validation/schemas'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { 
  createAuditLog, 
  logDataModification, 
  AuditAction,
  logAuthAttempt,
  logSecurityEvent 
} from '@/lib/security/audit-logger'
import { 
  ValidationError, 
  NotFoundError, 
  ForbiddenError,
  UnauthorizedError,
  toAppError,
  formatErrorResponse 
} from '@/lib/errors/app-error'
import { hasPermission, hasRequiredRole, getUserPermissions, ROLE_HIERARCHY } from '@/lib/auth/config'
import bcrypt from 'bcryptjs'

/**
 * GET /api/users - List users with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.READ)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const ministryId = searchParams.get('ministryId')
    const departmentId = searchParams.get('departmentId')
    const isActive = searchParams.get('isActive')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check permissions
    const permissions = await getUserPermissions((session.user as any).id)
    const canViewAll = permissions.includes('users:view_all')
    const canViewMinistry = permissions.includes('users:view_ministry')

    const where: any = {}

    if (!canViewAll) {
      if (canViewMinistry && (session.user as any).ministryId) {
        where.ministryId = (session.user as any).ministryId
      } else {
        // Users can only see themselves
        where.id = (session.user as any).id
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) where.role = role
    if (ministryId) where.ministryId = ministryId
    if (departmentId) where.departmentId = departmentId
    if (isActive !== null) where.isActive = isActive === 'true'

    const total = await db.user.count({ where })

    const users = await db.user.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ministryId: true,
        departmentId: true,
        position: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        ministry: { select: { name: true, code: true } },
        department: { select: { name: true } },
        _count: {
          select: {
            projects: true,
            reports: true,
            kpis: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.DATA_ACCESS,
      entityType: 'USER',
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { accessType: 'LIST' },
    })

    return NextResponse.json({
      success: true,
      data: {
        users,
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
 * POST /api/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    // Check permission
    const canCreate = await hasPermission((session.user as any).id, 'users:create')
    if (!canCreate) {
      throw new ForbiddenError('You do not have permission to create users')
    }

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.WRITE)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const body = await request.json()
    const validatedData = signUpSchema.parse(body)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      throw new ValidationError('Email already registered', { field: 'email' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Check if assigning role is allowed
    const currentRole = (session.user as any).role as string
    if (validatedData.role && ROLE_HIERARCHY[validatedData.role] > ROLE_HIERARCHY[currentRole]) {
      throw new ForbiddenError('You cannot assign a role higher than your own')
    }

    // Create user
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role || 'ANALYST',
        ministryId: validatedData.ministryId,
        departmentId: validatedData.departmentId,
        position: validatedData.position,
        phone: validatedData.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ministryId: true,
        departmentId: true,
        position: true,
        phone: true,
        isActive: true,
        createdAt: true,
        ministry: { select: { name: true, code: true } },
        department: { select: { name: true } },
      },
    })

    await logDataModification(
      (session.user as any).id,
      AuditAction.USER_CREATE,
      'USER',
      user.id,
      undefined,
      { name: user.name, email: user.email, role: user.role },
      getClientIP(request),
      getUserAgent(request)
    )

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully',
    }, {
      status: 201,
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
