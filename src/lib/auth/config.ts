import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: {
            ministry: true,
            department: true,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Account is deactivated')
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Account is temporarily locked. Please try again later.')
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Increment failed login attempts
          const failedAttempts = (user.failedLoginAttempts || 0) + 1
          const updateData: any = { failedLoginAttempts }

          // Lock account after 5 failed attempts
          if (failedAttempts >= 5) {
            updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
          }

          await db.user.update({
            where: { id: user.id },
            data: updateData,
          })

          throw new Error('Invalid credentials')
        }

        // Reset failed login attempts on successful login
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        })

        // Check if password must be changed
        if (user.mustChangePassword) {
          throw new Error('MUST_CHANGE_PASSWORD')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          ministryId: user.ministryId,
          departmentId: user.departmentId,
          ministry: user.ministry,
          department: user.department,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.ministryId = user.ministryId
        token.departmentId = user.departmentId
        token.ministry = user.ministry
        token.department = user.department
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
        (session.user as any).ministryId = token.ministryId
        (session.user as any).departmentId = token.departmentId
        (session.user as any).ministry = token.ministry
        (session.user as any).department = token.department
      }
      return session
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      // Log successful sign in
      if (user) {
        await db.auditLog.create({
          data: {
            userId: (user as any).id,
            action: 'LOGIN',
            entityType: 'USER',
            entityId: (user as any).id,
            success: true,
            ipAddress: '', // Will be filled in the API route
            userAgent: '', // Will be filled in the API route
          },
        })
      }
    },
  },
}

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  PRESIDENT: 90,
  PRIME_MINISTER: 85,
  MINISTER: 70,
  DIRECTOR: 60,
  MANAGER: 50,
  ANALYST: 40,
  VIEWER: 30,
  ADMIN: 80,
}

// Check if user has required role or higher
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Check if user has permission
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  // Get user with role
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) return false

  // Super admin has all permissions
  if (user.role === 'SUPER_ADMIN') return true

  // Check role-based permissions
  const rolePermission = await db.rolePermission.findFirst({
    where: {
      role: user.role,
      permission: {
        name: permission,
      },
    },
  })

  if (rolePermission) return true

  // Check user-specific permissions
  const userPermission = await db.userPermission.findFirst({
    where: {
      userId,
      permission: {
        name: permission,
      },
      granted: true,
    },
  })

  return !!userPermission
}

// Get all user permissions
export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) return []

  // Super admin has all permissions
  if (user.role === 'SUPER_ADMIN') {
    const allPermissions = await db.permission.findMany()
    return allPermissions.map((p) => p.name)
  }

  const rolePermissions = await db.rolePermission.findMany({
    where: { role: user.role },
    include: { permission: true },
  })

  const userPermissions = await db.userPermission.findMany({
    where: { userId, granted: true },
    include: { permission: true },
  })

  const permissions = new Set<string>()

  rolePermissions.forEach((rp) => permissions.add(rp.permission.name))
  userPermissions.forEach((up) => permissions.add(up.permission.name))

  return Array.from(permissions)
}
