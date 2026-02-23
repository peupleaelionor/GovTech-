import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Initialize default workflows for approvals
 */
export async function POST() {
  try {
    // Project Approval Workflow
    const projectWorkflow = await db.workflow.upsert({
      where: { id: 'workflow-projects' },
      update: {},
      create: {
        id: 'workflow-projects',
        name: 'Project Approval Workflow',
        description: 'Standard approval process for new projects',
        entityType: 'PROJECT',
        stages: JSON.stringify([
          {
            name: 'department_review',
            label: 'Department Review',
            description: 'Initial review by department head',
            required: true,
            approvers: [], // Will be assigned dynamically based on department
          },
          {
            name: 'ministry_review',
            label: 'Ministry Review',
            description: 'Review and approval by ministry',
            required: true,
            approvers: [], // Will be assigned dynamically based on ministry
          },
          {
            name: 'final_approval',
            label: 'Final Approval',
            description: 'Final approval by executive',
            required: false,
            approvers: [], // Will be assigned dynamically
          },
        ]),
        isActive: true,
      },
    })

    // Budget Approval Workflow
    const budgetWorkflow = await db.workflow.upsert({
      where: { id: 'workflow-budgets' },
      update: {},
      create: {
        id: 'workflow-budgets',
        name: 'Budget Approval Workflow',
        description: 'Standard approval process for budget allocations',
        entityType: 'BUDGET',
        stages: JSON.stringify([
          {
            name: 'financial_review',
            label: 'Financial Review',
            description: 'Review by finance team',
            required: true,
            approvers: [],
          },
          {
            name: 'ministry_approval',
            label: 'Ministry Approval',
            description: 'Approval by ministry head',
            required: true,
            approvers: [],
          },
        ]),
        isActive: true,
      },
    })

    // Report Approval Workflow
    const reportWorkflow = await db.workflow.upsert({
      where: { id: 'workflow-reports' },
      update: {},
      create: {
        id: 'workflow-reports',
        name: 'Report Approval Workflow',
        description: 'Approval process for official reports',
        entityType: 'REPORT',
        stages: JSON.stringify([
          {
            name: 'content_review',
            label: 'Content Review',
            description: 'Review of report content and accuracy',
            required: true,
            approvers: [],
          },
          {
            name: 'ministry_review',
            label: 'Ministry Review',
            description: 'Review and approval by ministry',
            required: true,
            approvers: [],
          },
          {
            name: 'executive_approval',
            label: 'Executive Approval',
            description: 'Final executive approval for publication',
            required: true,
            approvers: [],
          },
        ]),
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Default workflows initialized successfully',
      data: {
        workflows: [
          projectWorkflow,
          budgetWorkflow,
          reportWorkflow,
        ],
      },
    })

  } catch (error) {
    console.error('Error seeding workflows:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed workflows' },
      { status: 500 }
    )
  }
}
