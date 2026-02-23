/**
 * Custom Application Error Classes
 * Provides structured error handling throughout the application
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED',
  PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
  MUST_CHANGE_PASSWORD = 'MUST_CHANGE_PASSWORD',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details
    
    Error.captureStackTrace(this)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      isOperational: this.isOperational,
    }
  }
}

// ============================================
// AUTHENTICATION ERRORS
// ============================================

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: Record<string, any>) {
    super(message, ErrorCode.UNAUTHORIZED, 401, true, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', details?: Record<string, any>) {
    super(message, ErrorCode.FORBIDDEN, 403, true, details)
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid email or password') {
    super(message, ErrorCode.INVALID_CREDENTIALS, 401)
  }
}

export class AccountLockedError extends AppError {
  constructor(message: string = 'Account is temporarily locked', unlockTime?: Date) {
    super(message, ErrorCode.ACCOUNT_LOCKED, 403, true, { unlockTime })
  }
}

export class AccountDeactivatedError extends AppError {
  constructor(message: string = 'Account has been deactivated') {
    super(message, ErrorCode.ACCOUNT_DEACTIVATED, 403)
  }
}

export class MustChangePasswordError extends AppError {
  constructor(message: string = 'Password must be changed') {
    super(message, ErrorCode.MUST_CHANGE_PASSWORD, 403)
  }
}

// ============================================
// VALIDATION ERRORS
// ============================================

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, details)
  }
}

export class InvalidInputError extends AppError {
  constructor(message: string, field?: string) {
    super(message, ErrorCode.INVALID_INPUT, 400, true, field ? { field } : undefined)
  }
}

export class MissingRequiredFieldError extends AppError {
  constructor(field: string) {
    super(`Missing required field: ${field}`, ErrorCode.MISSING_REQUIRED_FIELD, 400, true, { field })
  }
}

// ============================================
// RESOURCE ERRORS
// ============================================

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`
    super(message, ErrorCode.NOT_FOUND, 404, true, { resource, identifier })
  }
}

export class AlreadyExistsError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' already exists`
      : `${resource} already exists`
    super(message, ErrorCode.ALREADY_EXISTS, 409, true, { resource, identifier })
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.CONFLICT, 409, true, details)
  }
}

// ============================================
// RATE LIMITING
// ============================================

export class RateLimitExceededError extends AppError {
  constructor(retryAfter: number, limit: number) {
    super(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      true,
      { retryAfter, limit }
    )
  }
}

// ============================================
// BUSINESS LOGIC ERRORS
// ============================================

export class BusinessRuleViolationError extends AppError {
  constructor(message: string, rule?: string, details?: Record<string, any>) {
    super(message, ErrorCode.BUSINESS_RULE_VIOLATION, 400, true, { rule, ...details })
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(
    resource: string,
    fromState: string,
    toState: string,
    validTransitions: string[]
  ) {
    super(
      `Cannot transition ${resource} from ${fromState} to ${toState}`,
      ErrorCode.INVALID_STATE_TRANSITION,
      400,
      true,
      { resource, fromState, toState, validTransitions }
    )
  }
}

export class OperationNotAllowedError extends AppError {
  constructor(message: string, reason?: string) {
    super(message, ErrorCode.OPERATION_NOT_ALLOWED, 403, true, { reason })
  }
}

// ============================================
// SYSTEM ERRORS
// ============================================

export class InternalError extends AppError {
  constructor(message: string = 'An internal error occurred', details?: Record<string, any>) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, false, details)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: any) {
    super(message, ErrorCode.DATABASE_ERROR, 500, false, {
      originalMessage: originalError?.message,
    })
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service ${service} is unavailable`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      503,
      false,
      { service }
    )
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, ErrorCode.NETWORK_ERROR, 503, false)
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string, timeout: number) {
    super(
      `${operation} timed out after ${timeout}ms`,
      ErrorCode.TIMEOUT_ERROR,
      504,
      false,
      { operation, timeout }
    )
  }
}

// ============================================
// ERROR UTILITIES
// ============================================

/**
 * Check if error is an operational error (expected, not a bug)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * Convert any error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new InternalError(error.message, {
      originalError: error.name,
      stack: error.stack,
    })
  }

  return new InternalError(String(error))
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: AppError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
  }
}
