import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

/**
 * Initialize default permissions and role mappings
 */
export async function POST() {
  try {
    // Define all permissions
    const permissions = [
      // User Management
      { name: 'users:create', category: 'users', action: 'create', resource: 'all', description: 'Create new users' },
      { name: 'users:read', category: 'users', action: 'read', resource: 'all', description: 'View user details' },
      { name: 'users:update', category: 'users', action: 'update', resource: 'all', description: 'Update user information' },
      { name: 'users:delete', category: 'users', action: 'delete', resource: 'all', description: 'Delete users' },
      { name: 'users:view_all', category: 'users', action: 'read', resource: 'all', description: 'View all users across organization' },
      { name: 'users:view_ministry', category: 'users', action: 'read', resource: 'ministry', description: 'View users in own ministry' },
      
      // Project Management
      { name: 'projects:create', category: 'projects', action: 'create', resource: 'all', description: 'Create new projects' },
      { name: 'projects:read', category: 'projects', action: 'read', resource: 'all', description: 'View project details' },
      { name: 'projects:update', category: 'projects', action: 'update', resource: 'all', description: 'Update project information' },
      { name: 'projects:delete', category: 'projects', action: 'delete', resource: 'all', description: 'Delete projects' },
      { name: 'projects:view_all', category: 'projects', action: 'read', resource: 'all', description: 'View all projects' },
      { name: 'projects:approve', category: 'projects', action: 'approve', resource: 'all', description: 'Approve projects' },
      
      // Budget Management
      { name: 'budgets:create', category: 'budgets', action: 'create', resource: 'all', description: 'Create budget entries' },
      { name: 'budgets:read', category: 'budgets', action: 'read', resource: 'all', description: 'View budget details' },
      { name: 'budgets:update', category: 'budgets', action: 'update', resource: 'all', description: 'Update budget entries' },
      { name: 'budgets:delete', category: 'budgets', action: 'delete', resource: 'all', description: 'Delete budget entries' },
      { name: 'budgets:approve', category: 'budgets', action: 'approve', resource: 'all', description: 'Approve budgets' },
      
      // Report Management
      { name: 'reports:create', category: 'reports', action: 'create', resource: 'all', description: 'Create reports' },
      { name: 'reports:read', category: 'reports', action: 'read', resource: 'all', description: 'View reports' },
      { name: 'reports:update', category: 'reports', action: 'update', resource: 'all', description: 'Update reports' },
      { name: 'reports:delete', category: 'reports', action: 'delete', resource: 'all', description: 'Delete reports' },
      { name: 'reports:approve', category: 'reports', action: 'approve', resource: 'all', description: 'Approve reports' },
      { name: 'reports:publish', category: 'reports', action: 'publish', resource: 'all', description: 'Publish reports' },
      { name: 'reports:generate_ai', category: 'reports', action: 'create', resource: 'all', description: 'Generate AI reports' },
      
      // KPI Management
      { name: 'kpis:create', category: 'kpis', action: 'create', resource: 'all', description: 'Create KPIs' },
      { name: 'kpis:read', category: 'kpis', action: 'read', resource: 'all', description: 'View KPIs' },
      { name: 'kpis:update', category: 'kpis', action: 'update', resource: 'all', description: 'Update KPIs' },
      { name: 'kpis:delete', category: 'kpis', action: 'delete', resource: 'all', description: 'Delete KPIs' },
      
      // Ministry Management
      { name: 'ministries:create', category: 'ministries', action: 'create', resource: 'all', description: 'Create ministries' },
      { name: 'ministries:read', category: 'ministries', action: 'read', resource: 'all', description: 'View ministries' },
      { name: 'ministries:update', category: 'ministries', action: 'update', resource: 'all', description: 'Update ministries' },
      { name: 'ministries:delete', category: 'ministries', action: 'delete', resource: 'all', description: 'Delete ministries' },
      
      // Department Management
      { name: 'departments:create', category: 'departments', action: 'create', resource: 'all', description: 'Create departments' },
      { name: 'departments:read', category: 'departments', action: 'read', resource: 'all', description: 'View departments' },
      { name: 'departments:update', category: 'departments', action: 'update', resource: 'all', description: 'Update departments' },
      { name: 'departments:delete', category: 'departments', action: 'delete', resource: 'all', description: 'Delete departments' },
      
      // Data Export
      { name: 'data:export', category: 'data', action: 'export', resource: 'all', description: 'Export data' },
      { name: 'data:import', category: 'data', action: 'import', resource: 'all', description: 'Import data' },
      
      // Audit & Logs
      { name: 'audit:view', category: 'audit', action: 'read', resource: 'all', description: 'View audit logs' },
      { name: 'audit:export', category: 'audit', action: 'export', resource: 'all', description: 'Export audit logs' },
      
      // System Settings
      { name: 'system:config', category: 'system', action: 'update', resource: 'all', description: 'Modify system configuration' },
      { name: 'system:manage', category: 'system', action: 'manage', resource: 'all', description: 'Full system management' },
    ]

    // Create permissions
    const createdPermissions = await Promise.all(
      permissions.map(p =>
        db.permission.upsert({
          where: { name: p.name },
          update: {},
          create: p,
        })
      )
    )

    // Define role-permission mappings
    const rolePermissions: Array<{ role: UserRole; permissions: string[] }> = [
      {
        role: 'SUPER_ADMIN',
        permissions: permissions.map(p => p.name), // All permissions
      },
      {
        role: 'PRESIDENT',
        permissions: [
          'projects:read', 'projects:view_all',
          'reports:read', 'reports:approve', 'reports:publish',
          'budgets:read', 'budgets:view_all',
          'kpis:read',
          'ministries:read',
          'data:export',
          'audit:view',
        ],
      },
      {
        role: 'PRIME_MINISTER',
        permissions: [
          'users:read', 'users:view_all',
          'projects:read', 'projects:view_all', 'projects:approve',
          'reports:read', 'reports:approve', 'reports:publish',
          'budgets:read', 'budgets:view_all', 'budgets:approve',
          'kpis:read', 'kpis:update',
          'ministries:read', 'ministries:update',
          'departments:read', 'departments:update',
          'data:export',
          'audit:view',
        ],
      },
      {
        role: 'MINISTER',
        permissions: [
          'users:read', 'users:view_ministry',
          'projects:create', 'projects:read', 'projects:update', 'projects:approve',
          'reports:create', 'reports:read', 'reports:update', 'reports:approve',
          'budgets:create', 'budgets:read', 'budgets:update', 'budgets:approve',
          'kpis:create', 'kpis:read', 'kpis:update',
          'departments:create', 'departments:read', 'departments:update',
          'data:export',
        ],
      },
      {
        role: 'DIRECTOR',
        permissions: [
          'users:read', 'users:view_ministry',
          'projects:create', 'projects:read', 'projects:update',
          'reports:create', 'reports:read', 'reports:update',
          'budgets:read', 'budgets:update',
          'kpis:create', 'kpis:read', 'kpis:update',
          'data:export',
        ],
      },
      {
        role: 'MANAGER',
        permissions: [
          'users:read',
          'projects:read', 'projects:update',
          'reports:read', 'reports:create',
          'budgets:read',
          'kpis:read', 'kpis:update',
          'data:export',
        ],
      },
      {
        role: 'ANALYST',
        permissions: [
          'projects:read',
          'reports:read',
          'budgets:read',
          'kpis:read', 'kpis:update',
          'data:export',
        ],
      },
      {
        role: 'VIEWER',
        permissions: [
          'projects:read',
          'reports:read',
          'budgets:read',
          'kpis:read',
        ],
      },
      {
        role: 'ADMIN',
        permissions: [
          'users:create', 'users:read', 'users:update',
          'ministries:create', 'ministries:read', 'ministries:update',
          'departments:create', 'departments:read', 'departments:update',
          'system:config',
          'data:export',
        ],
      },
    ]

    // Create role-permission mappings
    await Promise.all(
      rolePermissions.flatMap(rp =>
        rp.permissions.map(permName =>
          db.rolePermission.upsert({
            where: {
              role_permissionId: {
                role: rp.role,
                permissionId: createdPermissions.find(p => p.name === permName)!.id,
              },
            },
            update: {},
            create: {
              role: rp.role,
              permissionId: createdPermissions.find(p => p.name === permName)!.id,
            },
          })
        )
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Permissions and role mappings initialized successfully',
      data: {
        permissionsCreated: createdPermissions.length,
        rolesConfigured: rolePermissions.length,
      },
    })

  } catch (error) {
    console.error('Error seeding permissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed permissions' },
      { status: 500 }
    )
  }
}
