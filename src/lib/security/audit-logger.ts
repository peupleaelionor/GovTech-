import { db } from '@/lib/db'
import { AuditAction } from './types'

// Audit action types
export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  
  // User Management
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_DEACTIVATE = 'USER_DEACTIVATE',
  USER_ACTIVATE = 'USER_ACTIVATE',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',
  
  // Project Management
  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_DELETE = 'PROJECT_DELETE',
  PROJECT_APPROVE = 'PROJECT_APPROVE',
  PROJECT_REJECT = 'PROJECT_REJECT',
  PROJECT_STATUS_CHANGE = 'PROJECT_STATUS_CHANGE',
  
  // Budget Management
  BUDGET_CREATE = 'BUDGET_CREATE',
  BUDGET_UPDATE = 'BUDGET_UPDATE',
  BUDGET_DELETE = 'BUDGET_DELETE',
  BUDGET_APPROVE = 'BUDGET_APPROVE',
  
  // Report Management
  REPORT_CREATE = 'REPORT_CREATE',
  REPORT_UPDATE = 'REPORT_UPDATE',
  REPORT_DELETE = 'REPORT_DELETE',
  REPORT_APPROVE = 'REPORT_APPROVE',
  REPORT_PUBLISH = 'REPORT_PUBLISH',
  REPORT_GENERATE_AI = 'REPORT_GENERATE_AI',
  
  // KPI Management
  KPI_CREATE = 'KPI_CREATE',
  KPI_UPDATE = 'KPI_UPDATE',
  KPI_DELETE = 'KPI_DELETE',
  
  // Ministry Management
  MINISTRY_CREATE = 'MINISTRY_CREATE',
  MINISTRY_UPDATE = 'MINISTRY_UPDATE',
  MINISTRY_DELETE = 'MINISTRY_DELETE',
  
  // Department Management
  DEPARTMENT_CREATE = 'DEPARTMENT_CREATE',
  DEPARTMENT_UPDATE = 'DEPARTMENT_UPDATE',
  DEPARTMENT_DELETE = 'DEPARTMENT_DELETE',
  
  // Approval & Workflow
  APPROVAL_REQUEST = 'APPROVAL_REQUEST',
  APPROVAL_GRANTED = 'APPROVAL_GRANTED',
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',
  
  // Communication
  COMMUNICATION_SEND = 'COMMUNICATION_SEND',
  COMMUNICATION_READ = 'COMMUNICATION_READ',
  
  // System
  SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE',
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA',
  BULK_OPERATION = 'BULK_OPERATION',
  
  // Security
  SECURITY_ALERT = 'SECURITY_ALERT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATA_ACCESS = 'DATA_ACCESS',
}

export interface AuditLogOptions {
  userId: string
  action: AuditAction | string
  entityType: string
  entityId?: string
  changes?: Record<string, any>
  success?: boolean
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(options: AuditLogOptions) {
  try {
    await db.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        changes: options.changes ? JSON.stringify(options.changes) : undefined,
        success: options.success ?? true,
        errorMessage: options.errorMessage,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break the application
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Log authentication attempt
 */
export async function logAuthAttempt(
  userId: string | null,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
) {
  if (!userId && success) {
    console.warn('Cannot log successful auth without user ID')
    return
  }

  if (!userId) return

  await createAuditLog({
    userId,
    action: success ? AuditAction.LOGIN : AuditAction.LOGIN_FAILED,
    entityType: 'USER',
    entityId: userId,
    success,
    errorMessage,
    ipAddress,
    userAgent,
  })
}

/**
 * Log data access
 */
export async function logDataAccess(
  userId: string,
  entityType: string,
  entityId: string | undefined,
  ipAddress?: string,
  userAgent?: string
) {
  await createAuditLog({
    userId,
    action: AuditAction.DATA_ACCESS,
    entityType,
    entityId,
    success: true,
    ipAddress,
    userAgent,
    metadata: { accessType: 'READ' },
  })
}

/**
 * Log data modification
 */
export async function logDataModification(
  userId: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  oldData?: Record<string, any>,
  newData?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  const changes: Record<string, any> = {}

  if (oldData && newData) {
    // Calculate diff
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        }
      }
    }
  } else if (newData) {
    // All fields are new
    Object.assign(changes, newData)
  }

  await createAuditLog({
    userId,
    action,
    entityType,
    entityId,
    changes: Object.keys(changes).length > 0 ? changes : undefined,
    success: true,
    ipAddress,
    userAgent,
  })
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  userId: string | null,
  event: AuditAction,
  details: {
    ipAddress?: string
    userAgent?: string
    errorMessage?: string
    metadata?: Record<string, any>
  }
) {
  if (!userId) {
    console.warn(`Cannot log security event without user ID: ${event}`)
    return
  }

  await createAuditLog({
    userId,
    action: event,
    entityType: 'SECURITY',
    success: false,
    errorMessage: details.errorMessage,
    ipAddress: details.ipAddress,
    userAgent: details.userAgent,
    metadata: details.metadata,
  })
}

/**
 * Get audit logs for an entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 50
) {
  return db.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
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
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100,
  offset: number = 0
) {
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
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
    }),
    db.auditLog.count({ where: { userId } }),
  ])

  return { logs, total }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(filters: {
  userId?: string
  action?: string
  entityType?: string
  entityId?: string
  success?: boolean
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const where: any = {}

  if (filters.userId) where.userId = filters.userId
  if (filters.action) where.action = filters.action
  if (filters.entityType) where.entityType = filters.entityType
  if (filters.entityId) where.entityId = filters.entityId
  if (filters.success !== undefined) where.success = filters.success
  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) where.createdAt.gte = filters.startDate
    if (filters.endDate) where.createdAt.lte = filters.endDate
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
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
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    db.auditLog.count({ where }),
  ])

  return { logs, total }
}
