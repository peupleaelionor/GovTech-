import { z } from 'zod'
import { UserRole, ProjectStatus, Priority, ReportType, ReportStatus, AlertType, Severity, CommunicationType } from '@prisma/client'

// ============================================
// USER SCHEMAS
// ============================================

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignInInput = z.infer<typeof signInSchema>

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  role: z.nativeEnum(UserRole).optional(),
  ministryId: z.string().optional(),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().regex(/^[+]?[\d\s-()]{10,20}$/, 'Invalid phone number').optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  position: z.string().optional(),
  phone: z.string().regex(/^[+]?[\d\s-()]{10,20}$/).optional(),
  ministryId: z.string().optional(),
  departmentId: z.string().optional(),
  isActive: z.boolean().optional(),
  role: z.nativeEnum(UserRole).optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ============================================
// MINISTRY SCHEMAS
// ============================================

export const createMinistrySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  code: z.string().min(2, 'Code must be at least 2 characters').max(20).toUpperCase(),
  description: z.string().max(1000).optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  address: z.string().max(500).optional(),
  phone: z.string().regex(/^[+]?[\d\s-()]{10,20}$/).optional(),
  email: z.string().email().optional(),
})

export type CreateMinistryInput = z.infer<typeof createMinistrySchema>

export const updateMinistrySchema = createMinistrySchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type UpdateMinistryInput = z.infer<typeof updateMinistrySchema>

// ============================================
// DEPARTMENT SCHEMAS
// ============================================

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(20).toUpperCase(),
  ministryId: z.string().min(1, 'Ministry ID is required'),
  description: z.string().max(1000).optional(),
  headId: z.string().optional(),
  budget: z.number().min(0).optional(),
})

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>

export const updateDepartmentSchema = createDepartmentSchema.partial()

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>

// ============================================
// PROJECT SCHEMAS
// ============================================

export const createProjectSchema = z.object({
  name: z.string().min(5, 'Project name must be at least 5 characters').max(200),
  code: z.string().min(2).max(20).toUpperCase(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive('Budget must be positive'),
  ministryId: z.string().min(1, 'Ministry ID is required'),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  location: z.string().max(500).optional(),
  requiresApproval: z.boolean().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = createProjectSchema.partial().extend({
  progress: z.number().min(0).max(100).optional(),
  spent: z.number().min(0).optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

export const projectQuerySchema = z.object({
  ministryId: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  managerId: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
  offset: z.string().optional().transform((val) => val ? parseInt(val) : 0),
  sortBy: z.enum(['name', 'createdAt', 'budget', 'progress', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type ProjectQueryInput = z.infer<typeof projectQuerySchema>

// ============================================
// BUDGET SCHEMAS
// ============================================

export const createBudgetSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  category: z.string().min(2).max(100),
  allocated: z.number().positive('Allocated amount must be positive'),
  spent: z.number().min(0).default(0),
  year: z.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4).optional(),
  description: z.string().max(1000).optional(),
}).refine((data) => data.spent <= data.allocated, {
  message: 'Spent cannot exceed allocated amount',
  path: ['spent'],
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>

export const updateBudgetSchema = createBudgetSchema.partial()

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>

// ============================================
// REPORT SCHEMAS
// ============================================

export const createReportSchema = z.object({
  title: z.string().min(5).max(200),
  type: z.nativeEnum(ReportType),
  content: z.string().min(10).max(50000),
  summary: z.string().max(2000).optional(),
  aiGenerated: z.boolean().default(true),
  format: z.string().default('PDF'),
  projectId: z.string().optional(),
  ministryId: z.string().optional(),
  status: z.nativeEnum(ReportStatus).optional(),
  requiresApproval: z.boolean().default(true),
})

export type CreateReportInput = z.infer<typeof createReportSchema>

export const updateReportSchema = createReportSchema.partial()

export type UpdateReportInput = z.infer<typeof updateReportSchema>

// ============================================
// KPI SCHEMAS
// ============================================

export const createKPISchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(20).toUpperCase(),
  description: z.string().max(1000).optional(),
  category: z.string().min(2).max(100),
  target: z.number(),
  current: z.number().default(0),
  unit: z.string().max(50).optional(),
  frequency: z.string().default('monthly'),
  projectId: z.string().optional(),
  ministryId: z.string().optional(),
  ownerId: z.string().optional(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  trend: z.enum(['up', 'down', 'stable']).default('stable'),
  isActive: z.boolean().default(true),
})

export type CreateKPIInput = z.infer<typeof createKPISchema>

export const updateKPISchema = createKPISchema.partial()

export type UpdateKPIInput = z.infer<typeof updateKPISchema>

// ============================================
// COMMUNICATION SCHEMAS
// ============================================

export const createCommunicationSchema = z.object({
  subject: z.string().min(5).max(200),
  content: z.string().min(10).max(10000),
  type: z.nativeEnum(CommunicationType),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  receiverId: z.string().min(1, 'Receiver ID is required'),
})

export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>

export const updateCommunicationSchema = createCommunicationSchema.partial()

export type UpdateCommunicationInput = z.infer<typeof updateCommunicationSchema>

// ============================================
// ALERT SCHEMAS
// ============================================

export const createAlertSchema = z.object({
  title: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  type: z.nativeEnum(AlertType),
  severity: z.nativeEnum(Severity).default(Severity.MEDIUM),
  source: z.string().max(100).optional(),
  userId: z.string().optional(),
  ministryId: z.string().optional(),
  projectId: z.string().optional(),
  metadata: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

export type CreateAlertInput = z.infer<typeof createAlertSchema>

export const updateAlertSchema = z.object({
  isRead: z.boolean().optional(),
  isResolved: z.boolean().optional(),
  resolvedAt: z.string().datetime().optional(),
})

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>

// ============================================
// SEARCH & FILTER SCHEMAS
// ============================================

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['all', 'projects', 'reports', 'users', 'ministries', 'budgets', 'kpis']).default('all'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export type SearchInput = z.infer<typeof searchSchema>

export const advancedFilterSchema = z.object({
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'contains', 'startsWith', 'endsWith']),
    value: z.any(),
  })),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export type AdvancedFilterInput = z.infer<typeof advancedFilterSchema>
