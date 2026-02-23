// Security and audit types

export type AuditAction = string

export interface SecurityContext {
  userId: string
  userRole: string
  ministryId?: string | null
  departmentId?: string | null
  ipAddress?: string
  userAgent?: string
}

export interface PermissionCheckResult {
  granted: boolean
  reason?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining?: number
  resetTime?: number
  retryAfter?: number
}

export interface AuditLogEntry {
  id: string
  userId: string
  action: string
  entityType: string
  entityId?: string
  changes?: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
  metadata?: string
  createdAt: Date
}

export interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'PERMISSION_DENIED' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  details: Record<string, any>
  timestamp: Date
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number // in days
  preventReuse: number // number of previous passwords to check
  lockoutThreshold: number // failed attempts
  lockoutDuration: number // in minutes
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  maxAge: 90,
  preventReuse: 5,
  lockoutThreshold: 5,
  lockoutDuration: 15,
}

export interface SecurityConfig {
  passwordPolicy: PasswordPolicy
  sessionTimeout: number // in minutes
  maxConcurrentSessions: number
  requireTwoFactor: boolean
  allowedIPRanges: string[]
  auditLogging: {
    enabled: boolean
    retentionDays: number
    logLevel: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE'
  }
  rateLimiting: {
    enabled: boolean
    strictMode: boolean
  }
}
