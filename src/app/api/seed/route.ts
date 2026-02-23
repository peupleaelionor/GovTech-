import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole, ProjectStatus, Priority, ReportType, ReportStatus, AlertType, Severity, CommunicationType } from '@prisma/client'

export async function POST() {
  try {
    // Create Ministries
    const ministries = await Promise.all([
      db.ministry.upsert({
        where: { code: 'MINEDU' },
        update: {},
        create: {
          name: 'Ministère de l\'Éducation Nationale',
          code: 'MINEDU',
          description: 'Responsable de l\'éducation nationale et de la formation professionnelle',
          budget: 500000000,
          address: 'Yaoundé, Cameroun',
          email: 'contact@minedu.cm',
          phone: '+237 222 23 34 45'
        }
      }),
      db.ministry.upsert({
        where: { code: 'MINSANTE' },
        update: {},
        create: {
          name: 'Ministère de la Santé Publique',
          code: 'MINSANTE',
          description: 'Responsable de la santé publique et des hôpitaux nationaux',
          budget: 750000000,
          address: 'Yaoundé, Cameroun',
          email: 'contact@minsante.cm',
          phone: '+237 222 22 11 33'
        }
      }),
      db.ministry.upsert({
        where: { code: 'MINTRANS' },
        update: {},
        create: {
          name: 'Ministère des Travaux Publics',
          code: 'MINTRANS',
          description: 'Responsable des infrastructures et des travaux publics',
          budget: 1200000000,
          address: 'Yaoundé, Cameroun',
          email: 'contact@mintrans.cm',
          phone: '+237 222 33 44 55'
        }
      }),
      db.ministry.upsert({
        where: { code: 'MINEFI' },
        update: {},
        create: {
          name: 'Ministère des Finances',
          code: 'MINEFI',
          description: 'Responsable de la politique budgétaire et financière',
          budget: 300000000,
          address: 'Yaoundé, Cameroun',
          email: 'contact@minefi.cm',
          phone: '+237 222 11 22 33'
        }
      })
    ])

    // Create Users
    const president = await db.user.upsert({
      where: { email: 'president@govtech.cm' },
      update: {},
      create: {
        email: 'president@govtech.cm',
        name: 'Président de la République',
        password: 'hashed_password',
        role: UserRole.PRESIDENT,
        position: 'Président',
        phone: '+237 222 00 00 00'
      }
    })

    const ministers = await Promise.all([
      db.user.upsert({
        where: { email: 'minedu@govtech.cm' },
        update: {},
        create: {
          email: 'minedu@govtech.cm',
          name: 'Ministre de l\'Éducation',
          password: 'hashed_password',
          role: UserRole.MINISTER,
          ministryId: ministries[0].id,
          position: 'Ministre',
          phone: '+237 222 23 34 46'
        }
      }),
      db.user.upsert({
        where: { email: 'minsante@govtech.cm' },
        update: {},
        create: {
          email: 'minsante@govtech.cm',
          name: 'Ministre de la Santé',
          password: 'hashed_password',
          role: UserRole.MINISTER,
          ministryId: ministries[1].id,
          position: 'Ministre',
          phone: '+237 222 22 11 34'
        }
      }),
      db.user.upsert({
        where: { email: 'mintrans@govtech.cm' },
        update: {},
        create: {
          email: 'mintrans@govtech.cm',
          name: 'Ministre des Travaux Publics',
          password: 'hashed_password',
          role: UserRole.MINISTER,
          ministryId: ministries[2].id,
          position: 'Ministre',
          phone: '+237 222 33 44 56'
        }
      })
    ])

    // Create Departments
    await Promise.all([
      db.department.upsert({
        where: { id: 'dept-edu-primary' },
        update: {},
        create: {
          id: 'dept-edu-primary',
          name: 'Enseignement Primaire',
          code: 'PRIM',
          ministryId: ministries[0].id,
          budget: 200000000,
          headId: ministers[0].id
        }
      }),
      db.department.upsert({
        where: { id: 'dept-sante-hospitals' },
        update: {},
        create: {
          id: 'dept-sante-hospitals',
          name: 'Hôpitaux Nationaux',
          code: 'HOSP',
          ministryId: ministries[1].id,
          budget: 400000000,
          headId: ministers[1].id
        }
      }),
      db.department.upsert({
        where: { id: 'dept-trans-roads' },
        update: {},
        create: {
          id: 'dept-trans-roads',
          name: 'Infrastructure Routière',
          code: 'ROADS',
          ministryId: ministries[2].id,
          budget: 600000000,
          headId: ministers[2].id
        }
      })
    ])

    // Create Projects
    const projects = await Promise.all([
      db.project.create({
        data: {
          name: 'Infrastructure Routière Nationale - Phase 1',
          code: 'IRN-2024-001',
          description: 'Construction et réhabilitation de 500km de routes nationales',
          status: ProjectStatus.IN_PROGRESS,
          priority: Priority.HIGH,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          progress: 65,
          budget: 450000000,
          spent: 292500000,
          ministryId: ministries[2].id,
          managerId: ministers[2].id,
          location: 'Nationwide'
        }
      }),
      db.project.create({
        data: {
          name: 'Digitalisation des Services Publics',
          code: 'DSP-2024-002',
          description: 'Mise en place de plateformes en ligne pour les services administratifs',
          status: ProjectStatus.IN_PROGRESS,
          priority: Priority.CRITICAL,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2025-06-30'),
          progress: 45,
          budget: 180000000,
          spent: 81000000,
          ministryId: ministries[3].id,
          managerId: ministers[2].id,
          location: 'Yaoundé'
        }
      }),
      db.project.create({
        data: {
          name: 'Programme Éducation 2025',
          code: 'EDU-2024-003',
          description: 'Modernisation du système éducatif et construction d\'écoles',
          status: ProjectStatus.IN_PROGRESS,
          priority: Priority.HIGH,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-12-31'),
          progress: 72,
          budget: 320000000,
          spent: 230400000,
          ministryId: ministries[0].id,
          managerId: ministers[0].id,
          location: 'Nationwide'
        }
      }),
      db.project.create({
        data: {
          name: 'Renforcement du Système de Santé',
          code: 'SNT-2024-004',
          description: 'Équipement des hôpitaux et formation du personnel médical',
          status: ProjectStatus.IN_PROGRESS,
          priority: Priority.CRITICAL,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2025-08-31'),
          progress: 58,
          budget: 520000000,
          spent: 301600000,
          ministryId: ministries[1].id,
          managerId: ministers[1].id,
          location: 'Nationwide'
        }
      }),
      db.project.create({
        data: {
          name: 'Développement des Infrastructures Numériques',
          code: 'DIN-2024-005',
          description: 'Déploiement de la fibre optique et centres de données',
          status: ProjectStatus.PLANNED,
          priority: Priority.HIGH,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2026-12-31'),
          progress: 0,
          budget: 280000000,
          spent: 0,
          ministryId: ministries[2].id,
          managerId: ministers[2].id,
          location: 'Major Cities'
        }
      })
    ])

    // Create Budgets
    await Promise.all([
      db.budget.create({
        data: {
          projectId: projects[0].id,
          category: 'Construction',
          allocated: 300000000,
          spent: 195000000,
          year: 2024,
          quarter: 4,
          description: 'Budget pour la construction des routes'
        }
      }),
      db.budget.create({
        data: {
          projectId: projects[0].id,
          category: 'Équipement',
          allocated: 150000000,
          spent: 97500000,
          year: 2024,
          quarter: 4,
          description: 'Budget pour les équipements lourds'
        }
      }),
      db.budget.create({
        data: {
          projectId: projects[2].id,
          category: 'Infrastructure',
          allocated: 200000000,
          spent: 144000000,
          year: 2024,
          quarter: 4,
          description: 'Construction d\'écoles'
        }
      }),
      db.budget.create({
        data: {
          projectId: projects[2].id,
          category: 'Formation',
          allocated: 120000000,
          spent: 86400000,
          year: 2024,
          quarter: 4,
          description: 'Formation des enseignants'
        }
      }),
      db.budget.create({
        data: {
          projectId: projects[3].id,
          category: 'Équipement Médical',
          allocated: 350000000,
          spent: 203000000,
          year: 2024,
          quarter: 4,
          description: 'Achat d\'équipements médicaux'
        }
      }),
      db.budget.create({
        data: {
          projectId: projects[3].id,
          category: 'Formation Personnel',
          allocated: 170000000,
          spent: 98600000,
          year: 2024,
          quarter: 4,
          description: 'Formation du personnel médical'
        }
      })
    ])

    // Create KPIs
    await Promise.all([
      db.kPI.create({
        data: {
          name: 'Taux de complétion des routes',
          code: 'ROAD-COMP',
          description: 'Pourcentage de routes complétées',
          category: 'Infrastructure',
          target: 80,
          current: 65,
          unit: '%',
          frequency: 'monthly',
          projectId: projects[0].id,
          ministryId: ministries[2].id,
          ownerId: ministers[2].id,
          year: 2024,
          month: 12,
          trend: 'up'
        }
      }),
      db.kPI.create({
        data: {
          name: 'Services digitalisés',
          code: 'DIGI-SERV',
          description: 'Nombre de services disponibles en ligne',
          category: 'Digitalisation',
          target: 50,
          current: 22,
          unit: 'services',
          frequency: 'monthly',
          projectId: projects[1].id,
          ministryId: ministries[3].id,
          ownerId: ministers[2].id,
          year: 2024,
          month: 12,
          trend: 'up'
        }
      }),
      db.kPI.create({
        data: {
          name: 'Écoles construites',
          code: 'SCHL-BUILT',
          description: 'Nombre d\'écoles construites',
          category: 'Éducation',
          target: 100,
          current: 72,
          unit: 'écoles',
          frequency: 'monthly',
          projectId: projects[2].id,
          ministryId: ministries[0].id,
          ownerId: ministers[0].id,
          year: 2024,
          month: 12,
          trend: 'up'
        }
      }),
      db.kPI.create({
        data: {
          name: 'Hôpitaux équipés',
          code: 'HOSP-EQUIP',
          description: 'Hôpitaux avec équipements modernes',
          category: 'Santé',
          target: 25,
          current: 15,
          unit: 'hôpitaux',
          frequency: 'monthly',
          projectId: projects[3].id,
          ministryId: ministries[1].id,
          ownerId: ministers[1].id,
          year: 2024,
          month: 12,
          trend: 'up'
        }
      }),
      db.kPI.create({
        data: {
          name: 'Budget exécuté',
          code: 'BUDG-EXEC',
          description: 'Pourcentage du budget exécuté',
          category: 'Finance',
          target: 90,
          current: 68,
          unit: '%',
          frequency: 'monthly',
          ministryId: ministries[3].id,
          ownerId: ministers[2].id,
          year: 2024,
          month: 12,
          trend: 'stable'
        }
      })
    ])

    // Create Alerts
    await Promise.all([
      db.alert.create({
        data: {
          title: 'Dépassement budgétaire - Projet IRN-2024-001',
          message: 'Le projet Infrastructure Routière a atteint 65% de son budget avec seulement 65% de progression. Révision nécessaire.',
          type: AlertType.BUDGET,
          severity: Severity.HIGH,
          source: 'System',
          projectId: projects[0].id,
          ministryId: ministries[2].id,
          userId: ministers[2].id
        }
      }),
      db.alert.create({
        data: {
          title: 'Délai critique - Projet DSP-2024-002',
          message: 'Le projet de digitalisation risque de ne pas respecter le délai de juin 2025. Accélération requise.',
          type: AlertType.DEADLINE,
          severity: Severity.CRITICAL,
          source: 'System',
          projectId: projects[1].id,
          ministryId: ministries[3].id,
          userId: ministers[2].id
        }
      }),
      db.alert.create({
        data: {
          title: 'KPI en dessous de la cible - Services digitalisés',
          message: 'Seulement 22 services digitalisés sur 50 attendus. Action corrective nécessaire.',
          type: AlertType.KPI,
          severity: Severity.MEDIUM,
          source: 'System',
          projectId: projects[1].id,
          ministryId: ministries[3].id
        }
      })
    ])

    // Create Reports
    await Promise.all([
      db.report.create({
        data: {
          title: 'Rapport Trimestriel Q4 2024',
          type: ReportType.QUARTERLY,
          content: 'Rapport détaillé sur l\'avancement des projets nationaux pour le quatrième trimestre 2024...',
          summary: 'Progression globale satisfaisante avec quelques projets nécessitant une attention particulière.',
          aiGenerated: true,
          format: 'PDF',
          authorId: president.id,
          status: ReportStatus.PUBLISHED
        }
      }),
      db.report.create({
        data: {
          title: 'Analyse Budgétaire Annuelle 2024',
          type: ReportType.BUDGET_ANALYSIS,
          content: 'Analyse complète de l\'exécution budgétaire pour l\'année 2024...',
          summary: 'Taux d\'exécution budgétaire de 68%. Recommandations pour améliorer l\'efficacité.',
          aiGenerated: true,
          format: 'PDF',
          ministryId: ministries[3].id,
          authorId: ministers[2].id,
          status: ReportStatus.PUBLISHED
        }
      }),
      db.report.create({
        data: {
          title: 'État des Projets Prioritaires',
          type: ReportType.PROJECT_STATUS,
          content: 'État d\'avancement des 10 projets prioritaires du gouvernement...',
          summary: '7 projets sur 10 sont dans les délais. 3 projets nécessitent une intervention.',
          aiGenerated: true,
          format: 'PDF',
          authorId: president.id,
          status: ReportStatus.PUBLISHED
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        ministries: ministries.length,
        users: ministers.length + 1,
        projects: projects.length
      }
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
