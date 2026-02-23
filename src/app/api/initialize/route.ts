import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Complete System Initialization
 * This endpoint initializes all system components in the correct order
 */
export async function POST() {
  const results = {
    permissions: null as any,
    workflows: null as any,
    data: null as any,
    settings: null as any,
    errors: [] as string[],
  }

  try {
    // Step 1: Initialize Permissions
    try {
      const permResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/seed-permissions`, {
        method: 'POST',
      })
      const permData = await permResponse.json()
      results.permissions = permData
    } catch (error) {
      results.errors.push(`Permissions: ${error}`)
    }

    // Step 2: Initialize Workflows
    try {
      const workflowResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/seed-workflows`, {
        method: 'POST',
      })
      const workflowData = await workflowResponse.json()
      results.workflows = workflowData
    } catch (error) {
      results.errors.push(`Workflows: ${error}`)
    }

    // Step 3: Initialize Demo Data
    try {
      const dataResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/seed`, {
        method: 'POST',
      })
      const data = await dataResponse.json()
      results.data = data
    } catch (error) {
      results.errors.push(`Demo Data: ${error}`)
    }

    // Step 4: Initialize System Settings
    try {
      await db.systemSetting.createMany({
        data: [
          {
            key: 'system.name',
            value: 'GovTech Intelligence Suite',
            category: 'GENERAL',
            description: 'System name',
            isPublic: true,
          },
          {
            key: 'system.version',
            value: '1.0.0',
            category: 'GENERAL',
            description: 'System version',
            isPublic: true,
          },
          {
            key: 'security.session.timeout',
            value: '30',
            category: 'SECURITY',
            description: 'Session timeout in minutes',
            isPublic: false,
          },
          {
            key: 'security.password.min_length',
            value: '8',
            category: 'SECURITY',
            description: 'Minimum password length',
            isPublic: true,
          },
          {
            key: 'security.password.require_uppercase',
            value: 'true',
            category: 'SECURITY',
            description: 'Require uppercase in password',
            isPublic: true,
          },
          {
            key: 'security.password.require_numbers',
            value: 'true',
            category: 'SECURITY',
            description: 'Require numbers in password',
            isPublic: true,
          },
          {
            key: 'security.max_failed_attempts',
            value: '5',
            category: 'SECURITY',
            description: 'Maximum failed login attempts',
            isPublic: true,
          },
          {
            key: 'security.lockout_duration',
            value: '15',
            category: 'SECURITY',
            description: 'Account lockout duration in minutes',
            isPublic: true,
          },
          {
            key: 'notifications.enabled',
            value: 'true',
            category: 'NOTIFICATION',
            description: 'Enable notifications',
            isPublic: false,
          },
          {
            key: 'audit.retention_days',
            value: '90',
            category: 'AUDIT',
            description: 'Audit log retention period in days',
            isPublic: false,
          },
        ],
        skipDuplicates: true,
      })

      const settings = await db.systemSetting.findMany()
      results.settings = {
        success: true,
        count: settings.length,
      }
    } catch (error) {
      results.errors.push(`Settings: ${error}`)
    }

    // Summary
    const summary = {
      success: results.errors.length === 0,
      totalSteps: 4,
      completedSteps: 4 - results.errors.length,
      failedSteps: results.errors.length,
      results,
    }

    return NextResponse.json({
      success: summary.success,
      message: summary.success
        ? 'System initialized successfully'
        : 'System initialized with some errors',
      summary,
    })

  } catch (error) {
    console.error('Initialization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize system',
        details: error,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/initialize - Get initialization status
 */
export async function GET() {
  try {
    const [
      permissionsCount,
      workflowsCount,
      projectsCount,
      usersCount,
      settingsCount,
    ] = await Promise.all([
      db.permission.count(),
      db.workflow.count(),
      db.project.count(),
      db.user.count(),
      db.systemSetting.count(),
    ])

    const status = {
      permissions: permissionsCount > 0,
      workflows: workflowsCount > 0,
      demoData: projectsCount > 0 && usersCount > 0,
      settings: settingsCount > 0,
      counts: {
        permissions: permissionsCount,
        workflows: workflowsCount,
        projects: projectsCount,
        users: usersCount,
        settings: settingsCount,
      },
    }

    const isInitialized = Object.values(status).every((v, i) => i < 4 ? v === true : true)

    return NextResponse.json({
      success: true,
      isInitialized,
      status,
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get initialization status' },
      { status: 500 }
    )
  }
}
