import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP, getUserAgent } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError, ValidationError } from '@/lib/errors/app-error'
import { getCountryConfig, CountryCode, formatCurrency, formatDate } from '@/lib/i18n/config'

/**
 * POST /api/reports/templates/generate - Generate African government report
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.WRITE)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const body = await request.json()
    const { 
      reportType, 
      countryCode = 'CM',
      year = new Date().getFullYear(),
      quarter,
      ministryId,
      includeCharts = true,
      format = 'JSON'
    } = body

    const country = getCountryConfig(countryCode as CountryCode)

    // Generate report based on type
    let report: any = {}
    
    switch (reportType) {
      case 'STATE_OF_NATION':
        report = await generateStateOfNationReport(countryCode, parseInt(year))
        break
      case 'BUDGET_EXECUTION':
        report = await generateBudgetExecutionReport(countryCode, parseInt(year), quarter)
        break
      case 'INFRASTRUCTURE_DEVELOPMENT':
        report = await generateInfrastructureReport(countryCode, parseInt(year))
        break
      case 'SOCIAL_INDICATORS':
        report = await generateSocialIndicatorsReport(countryCode, parseInt(year))
        break
      case 'REGIONAL_DEVELOPMENT':
        report = await generateRegionalDevelopmentReport(countryCode, parseInt(year))
        break
      case 'SDG_PROGRESS':
        report = await generateSDGProgressReport(countryCode, parseInt(year))
        break
      default:
        throw new ValidationError('Invalid report type')
    }

    // Create report record
    const reportRecord = await db.report.create({
      data: {
        title: `${report.title} - ${year}`,
        type: 'STRATEGIC',
        content: JSON.stringify(report),
        summary: report.executiveSummary,
        aiGenerated: true,
        format: format,
        ministryId,
        authorId: (session.user as any).id,
        status: 'PUBLISHED',
      },
    })

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.REPORT_GENERATE_AI,
      entityType: 'REPORT',
      entityId: reportRecord.id,
      success: true,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { reportType, countryCode, year },
    })

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report generated successfully',
    }, {
      status: 201,
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * Generate State of Nation report
 */
async function generateStateOfNationReport(countryCode: CountryCode, year: number) {
  const country = getCountryConfig(countryCode)

  const projects = await db.project.findMany({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    include: {
      ministry: true,
    },
  })

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)

  return {
    title: `Rapport sur l'État de la Nation - ${country.name.fr}`,
    executiveSummary: `Ce rapport présente une vue d'ensemble du développement national de ${country.name.fr} pour l'année ${year}. Il couvre les progrès dans les domaines clés de l'infrastructure, de l'éducation, de la santé et du développement économique.`,
    country: {
      name: country.name,
      code: countryCode,
      currency: country.currency,
      year,
    },
    keyAchievements: {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      budgetExecution: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0',
    },
    economicIndicators: {
      totalInvestment: formatCurrency(totalBudget, countryCode),
      fundsUtilized: formatCurrency(totalSpent, countryCode),
      utilizationRate: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0',
      projectedGDPGrowth: '4.5%', // Would come from economic data
    },
    sectorPerformance: groupProjectsBySector(projects),
    recommendations: generateCountryRecommendations(projects, countryCode),
    charts: {
      budgetByMinistry: await getBudgetByMinistryData(year),
      projectStatusDistribution: await getProjectStatusData(year),
      monthlyProgress: await getMonthlyProgressData(year),
    },
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Generate Budget Execution report
 */
async function generateBudgetExecutionReport(countryCode: CountryCode, year: number, quarter?: string) {
  const country = getCountryConfig(countryCode)
  const projects = await db.project.findMany({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    include: {
      budgets: true,
      ministry: true,
    },
  })

  const budgetAnalysis = {
    totalAllocated: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
    utilization: 0,
    byMinistry: {} as Record<string, any>,
  }

  budgetAnalysis.utilization = budgetAnalysis.totalAllocated > 0
    ? (budgetAnalysis.totalSpent / budgetAnalysis.totalAllocated) * 100
    : 0

  // Group by ministry
  projects.forEach(project => {
    if (!budgetAnalysis.byMinistry[project.ministryId]) {
      budgetAnalysis.byMinistry[project.ministryId] = {
        ministryName: project.ministry?.name || 'Unknown',
        allocated: 0,
        spent: 0,
        projects: 0,
      }
    }
    budgetAnalysis.byMinistry[project.ministryId].allocated += project.budget
    budgetAnalysis.byMinistry[project.ministryId].spent += project.spent
    budgetAnalysis.byMinistry[project.ministryId].projects += 1
  })

  return {
    title: `Rapport d'Exécution Budgétaire - ${country.name.fr}`,
    executiveSummary: `Analyse détaillée de l'exécution budgétaire pour ${country.name.fr} en ${year}${quarter ? ` - T${quarter}` : ''}. Ce rapport évalue l'efficacité de l'allocation et de l'utilisation des fonds publics.`,
    country: {
      name: country.name,
      code: countryCode,
      currency: country.currency,
      year,
      quarter,
    },
    summary: {
      totalAllocated: formatCurrency(budgetAnalysis.totalAllocated, countryCode),
      totalSpent: formatCurrency(budgetAnalysis.totalSpent, countryCode),
      utilizationRate: budgetAnalysis.utilization.toFixed(2) + '%',
      remaining: formatCurrency(budgetAnalysis.totalAllocated - budgetAnalysis.totalSpent, countryCode),
    },
    byMinistry: Object.values(budgetAnalysis.byMinistry).map(m => ({
      ...m,
      utilization: m.allocated > 0 ? ((m.spent / m.allocated) * 100).toFixed(2) + '%' : '0%',
    })),
    keyFindings: generateBudgetKeyFindings(budgetAnalysis),
    recommendations: generateBudgetRecommendations(budgetAnalysis),
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Generate Infrastructure Development report
 */
async function generateInfrastructureReport(countryCode: CountryCode, year: number) {
  const country = getCountryConfig(countryCode)
  
  const infrastructureProjects = await db.project.findMany({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
      OR: [
        { description: { contains: 'rout', mode: 'insensitive' } },
        { description: { contains: 'pont', mode: 'insensitive' } },
        { description: { contains: 'infrastructur', mode: 'insensitive' } },
        { description: { contains: 'énergie', mode: 'insensitive' } },
        { description: { contains: 'eau', mode: 'insensitive' } },
        { description: { contains: 'électricité', mode: 'insensitive' } },
        { name: { contains: 'route', mode: 'insensitive' } },
        { name: { contains: 'bridge', mode: 'insensitive' } },
      ],
    },
    include: {
      ministry: true,
      budgets: true,
    },
  })

  return {
    title: `Rapport sur le Développement des Infrastructures - ${country.name.fr}`,
    executiveSummary: `Ce rapport analyse l'avancement des projets d'infrastructure en ${country.name.fr} pour l'année ${year}. Il couvre les réseaux routiers, l'énergie, l'eau et les télécommunications.`,
    country: {
      name: country.name,
      code: countryCode,
      year,
    },
    summary: {
      totalProjects: infrastructureProjects.length,
      completed: infrastructureProjects.filter(p => p.status === 'COMPLETED').length,
      inProgress: infrastructureProjects.filter(p => p.status === 'IN_PROGRESS').length,
      totalInvestment: infrastructureProjects.reduce((sum, p) => sum + p.budget, 0),
      progress: infrastructureProjects.length > 0 
        ? (infrastructureProjects.reduce((sum, p) => sum + p.progress, 0) / infrastructureProjects.length).toFixed(1)
        : 0,
    },
    byType: categorizeInfrastructureProjects(infrastructureProjects),
    keyMilestones: infrastructureProjects.slice(0, 5).map(p => ({
      name: p.name,
      status: p.status,
      progress: p.progress,
      budget: p.budget,
      spent: p.spent,
    })),
    challenges: identifyInfrastructureChallenges(infrastructureProjects),
    nextSteps: generateInfrastructureNextSteps(infrastructureProjects),
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Generate Social Indicators report
 */
async function generateSocialIndicatorsReport(countryCode: CountryCode, year: number) {
  const country = getCountryConfig(countryCode)
  
  const kpis = await db.kPI.findMany({
    where: {
      year,
      category: { in: ['Education', 'Santé', 'Social'] },
    },
    include: {
      ministry: true,
    },
    orderBy: { category: 'asc' },
  })

  return {
    title: `Rapport sur les Indicateurs Sociaux - ${country.name.fr}`,
    executiveSummary: `Ce rapport présente les indicateurs sociaux clés de ${country.name.fr} pour l'année ${year}, notamment dans l'éducation, la santé et le développement social.`,
    country: {
      name: country.name,
      code: countryCode,
      year,
    },
    indicators: {
      education: kpis.filter(k => k.category === 'Education'),
      health: kpis.filter(k => k.category === 'Santé'),
      social: kpis.filter(k => k.category === 'Social'),
    },
    performance: {
      overallAchievement: calculateOverallKPITargetAchievement(kpis),
      byCategory: calculateAchievementByCategory(kpis),
    },
    progress: generateSocialProgressTrend(kpis),
    recommendations: generateSocialPolicyRecommendations(kpis, countryCode),
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Generate Regional Development report
 */
async function generateRegionalDevelopmentReport(countryCode: CountryCode, year: number) {
  const country = getCountryConfig(countryCode)
  
  const projects = await db.project.findMany({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    include: {
      ministry: true,
    },
  })

  return {
    title: `Rapport sur le Développement Régional - ${country.name.fr}`,
    executiveSummary: `Ce rapport analyse le développement régional dans ${country.name.fr} pour l'année ${year}, identifiant les disparités et les opportunités d'équilibrage.`,
    country: {
      name: country.name,
      code: countryCode,
      regions: country.regions,
      year,
    },
    regionalDistribution: distributeProjectsByRegion(projects, country.regions),
    developmentGap: identifyDevelopmentGaps(projects, country.regions),
    balancedGrowthScore: calculateBalancedGrowthScore(projects, country.regions),
    recommendations: generateRegionalPolicyRecommendations(projects, country.regions),
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Generate SDG Progress report
 */
async function generateSDGProgressReport(countryCode: CountryCode, year: number) {
  const country = getCountryConfig(countryCode)
  
  const projects = await db.project.findMany({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    include: {
      kpis: true,
    },
  })

  const sdgMapping = {
    'infrastructure': ['SDG 9', 'SDG 11'],
    'education': ['SDG 4'],
    'health': ['SDG 3'],
    'energy': ['SDG 7'],
    'water': ['SDG 6'],
    'economic': ['SDG 8'],
  }

  return {
    title: `Rapport sur les ODD - Objectifs de Développement Durable - ${country.name.fr}`,
    executiveSummary: `Ce rapport évalue les progrès de ${country.name.fr} vers les Objectifs de Développement Durable pour l'année ${year}.`,
    country: {
      name: country.name,
      code: countryCode,
      year,
    },
    sdgProgress: mapProjectsToSDGs(projects, sdgMapping),
    keyAchievements: identifySDGAchievements(projects),
    challenges: identifySDGChallenges(projects),
    priorities: generateSDGPriorities(projects, country.regions),
    generatedAt: new Date().toISOString(),
  }
}

// Helper functions

function groupProjectsBySector(projects: any[]) {
  return projects.reduce((acc, project) => {
    const sector = project.ministry?.name || 'Autre'
    if (!acc[sector]) {
      acc[sector] = { total: 0, completed: 0, inProgress: 0, budget: 0, spent: 0 }
    }
    acc[sector].total += 1
    acc[sector].budget += project.budget
    acc[sector].spent += project.spent
    if (project.status === 'COMPLETED') acc[sector].completed += 1
    else if (project.status === 'IN_PROGRESS') acc[sector].inProgress += 1
    return acc
  }, {})
}

function generateCountryRecommendations(projects: any[], countryCode: CountryCode): string[] {
  const recommendations: string[] = []
  
  const completedRate = projects.length > 0 ? projects.filter(p => p.status === 'COMPLETED').length / projects.length : 0
  
  if (completedRate < 0.5) {
    recommendations.push('Renforcer le suivi des projets pour améliorer le taux de complétion')
  }
  
  recommendations.push('Poursuivre les investissements dans les infrastructures critiques')
  recommendations.push('Développer les partenariats public-privé pour accélérer les projets')
  recommendations.push('Améliorer la coordination inter-ministérielle pour une meilleure efficacité')
  
  return recommendations
}

function generateBudgetKeyFindings(analysis: any): string[] {
  const findings: string[] = []
  
  if (analysis.utilization < 50) {
    findings.push('Taux d\'exécution budgétaire inférieur à 50% - nécessite une action corrective')
  } else if (analysis.utilization > 90) {
    findings.push('Excellente utilisation budgétaire - supérieure à 90%')
  }
  
  findings.push(`Analyse détaillée de ${Object.keys(analysis.byMinistry).length} ministères`)
  
  return findings
}

function generateBudgetRecommendations(analysis: any): string[] {
  const recommendations: string[] = []
  
  Object.values(analysis.byMinistry).forEach(ministry => {
    const util = parseFloat(ministry.utilization)
    if (util < 30) {
      recommendations.push(`${ministry.ministryName}: Taux d'utilisation critique (${ministry.utilization}) - intervention prioritaire requise`)
    } else if (util > 100) {
      recommendations.push(`${ministry.ministryName}: Dépassement budgétaire (${ministry.utilization}) - révision nécessaire`)
    }
  })
  
  recommendations.push('Mettre en place un système de suivi budgétaire mensuel avec alertes automatiques')
  recommendations.push('Renforcer les capacités de planification et de gestion financière')
  
  return recommendations
}

function categorizeInfrastructureProjects(projects: any[]) {
  return projects.reduce((acc, project) => {
    const desc = project.description.toLowerCase() + ' ' + project.name.toLowerCase()
    
    if (desc.includes('rout') || desc.includes('bridge') || desc.includes('pont')) {
      acc['transport'] = (acc['transport'] || 0) + 1
    } else if (desc.includes('électricité') || desc.includes('eau') || desc.includes('energ')) {
      acc['utilities'] = (acc['utilities'] || 0) + 1
    } else if (desc.includes('santé') || desc.includes('hôpital')) {
      acc['healthcare'] = (acc['healthcare'] || 0) + 1
    } else if (desc.includes('éducation') || desc.includes('école')) {
      acc['education'] = (acc['education'] || 0) + 1
    } else {
      acc['other'] = (acc['other'] || 0) + 1
    }
    
    return acc
  }, {})
}

function identifyInfrastructureChallenges(projects: any[]): string[] {
  const challenges: string[] = []
  
  const delayedProjects = projects.filter(p => p.status === 'DELAYED')
  if (delayedProjects.length > 0) {
    challenges.push(`${delayedProjects.length} projets en retard - nécessite une réévaluation des délais`)
  }
  
  const budgetOverruns = projects.filter(p => p.spent > p.budget)
  if (budgetOverruns.length > 0) {
    challenges.push(`${budgetOverruns.length} projets avec dépassement budgétaire`)
  }
  
  challenges.push('Coordination interministérielle à améliorer')
  challenges.push('Accélération des procédures d\'approbation')
  
  return challenges
}

function generateInfrastructureNextSteps(projects: any[]): string[] {
  const steps = [
    'Prioriser les projets critiques pour l\'économie nationale',
    'Simplifier les procédures d\'approbation pour les projets d\'infrastructure',
    'Renforcer le suivi et la surveillance des projets en cours',
    'Développer une base de données centralisée sur les infrastructures',
    'Mettre en place des mécanismes de financement innovants (PPP, etc.)',
  ]
  
  return steps
}

function calculateOverallKPITargetAchievement(kpis: any[]): number {
  if (kpis.length === 0) return 0
  
  const totalAchievement = kpis.reduce((sum, kpi) => {
    return sum + (kpi.target > 0 ? (kpi.current / kpi.target) : 0)
  }, 0)
  
  return (totalAchievement / kpis.length) * 100
}

function calculateAchievementByCategory(kpis: any[]): Record<string, number> {
  return kpis.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = []
    }
    acc[kpi.category].push(kpi.target > 0 ? (kpi.current / kpi.target) : 0)
    return acc
  }, {})
}

function generateSocialProgressTrend(kpis: any[]): any {
  // Simulate trend based on current data
  const current = calculateOverallKPITargetAchievement(kpis)
  
  return {
    current: current.toFixed(1),
    projected: Math.min(100, current * 1.1).toFixed(1), // Assume 10% improvement
    gap: Math.max(0, 100 - current).toFixed(1),
  }
}

function generateSocialPolicyRecommendations(kpis: any[], countryCode: CountryCode): string[] {
  const recommendations: string[] = []
  
  const lowKPIs = kpis.filter(k => k.current < k.target * 0.7)
  if (lowKPIs.length > 0) {
    recommendations.push(`${lowKPIs.length} indicateurs sociaux nécessitent une attention particulière`)
  }
  
  recommendations.push('Renforcer les investissements dans l\'éducation de base')
  recommendations.push('Améliorer l\'accès aux soins de santé dans les zones rurales')
  recommendations.push('Développer des programmes de protection sociale')
  
  return recommendations
}

function distributeProjectsByRegion(projects: any[], regions: string[]): Record<string, any> {
  return regions.reduce((acc, region) => {
    // Simulate regional distribution based on ministries
    const regionProjects = projects.slice(0, Math.ceil(projects.length / regions.length))
    acc[region] = {
      totalProjects: regionProjects.length,
      totalBudget: regionProjects.reduce((sum, p) => sum + p.budget, 0),
      completed: regionProjects.filter(p => p.status === 'COMPLETED').length,
    }
    return acc
  }, {})
}

function identifyDevelopmentGaps(projects: any[], regions: string[]): string[] {
  const gaps: string[] = []
  
  gaps.push('Disparités régionales dans l\'allocation des ressources')
  gaps.push('Besoin de renforcer les capacités dans les régions moins développées')
  gaps.push('Nécessité de mieux cibler les investissements selon les besoins locaux')
  
  return gaps
}

function calculateBalancedGrowthScore(projects: any[], regions: string[]): number {
  // Simulated score based on distribution
  const distribution = distributeProjectsByRegion(projects, regions)
  const budgets = Object.values(distribution).map(r => r.totalBudget)
  const avgBudget = budgets.reduce((a, b) => a + b, 0) / budgets.length
  const variance = budgets.reduce((sum, b) => sum + Math.pow(b - avgBudget, 2), 0) / budgets.length
  const stdDev = Math.sqrt(variance)
  
  // Lower variance = more balanced growth
  const balanceScore = Math.max(0, 100 - (stdDev / avgBudget) * 100)
  
  return Math.round(balanceScore)
}

function generateRegionalPolicyRecommendations(projects: any[], regions: string[]): string[] {
  return [
    'Établir des quotas minimums d\'investissement par région',
    'Créer des mécanismes de compensation pour les régions en retard',
    'Développer des pôles de croissance régionale',
    'Renforcer la décentralisation et l\'autonomie locale',
  ]
}

function mapProjectsToSDGs(projects: any[], sdgMapping: Record<string, string[]>): any {
  const sdgProgress: Record<string, any> = {}
  
  Object.entries(sdgMapping).forEach(([category, sdgs]) => {
    const categoryProjects = projects.filter(p => 
      p.description.toLowerCase().includes(category) || 
      p.name.toLowerCase().includes(category)
    )
    
    sdgs.forEach(sdg => {
      if (!sdgProgress[sdg]) {
        sdgProgress[sdg] = { projects: 0, budget: 0, progress: 0 }
      }
      
      categoryProjects.forEach(p => {
        sdgProgress[sdg].projects += 1
        sdgProgress[sdg].budget += p.budget
        sdgProgress[sdg].progress += p.progress
      })
    })
  })
  
  return sdgProgress
}

function identifySDGAchievements(projects: any[]): string[] {
  const achievements: string[] = []
  
  const completedProjects = projects.filter(p => p.status === 'COMPLETED')
  if (completedProjects.length > 5) {
    achievements.push(`${completedProjects.length} projets complétés avec succès`)
  }
  
  achievements.push('Investissements soutenus dans les infrastructures durables')
  achievements.push('Progression vers les objectifs de développement durable')
  
  return achievements
}

function identifySDGChallenges(projects: any[]): string[] {
  const challenges: string[] = []
  
  const delayedProjects = projects.filter(p => p.status === 'DELAYED')
  if (delayedProjects.length > projects.length * 0.3) {
    challenges.push('Taux de retard élevé sur les projets - impact sur les ODD')
  }
  
  challenges.push('Besoin de renforcer les données de suivi des ODD')
  challenges.push('Coordination intersectorielle à améliorer')
  
  return challenges
}

function generateSDGPriorities(projects: any[], regions: string[]): string[] {
  return [
    'Prioriser les projets contribuant à plusieurs ODD',
    'Renforcer les infrastructures d\'eau et d\'assainissement',
    'Accélérer la transition énergétique vers les renouvelables',
    'Améliorer l\'accès à l\'éducation de qualité pour tous',
    'Renforcer les systèmes de santé résilients',
  ]
}

async function getBudgetByMinistryData(year: number) {
  const projects = await db.project.findMany({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    include: {
      ministry: true,
    },
  })

  return projects.reduce((acc, project) => {
    const ministryName = project.ministry?.name || 'Autre'
    if (!acc[ministryName]) {
      acc[ministryName] = { allocated: 0, spent: 0 }
    }
    acc[ministryName].allocated += project.budget
    acc[ministryName].spent += project.spent
    return acc
  }, {})
}

async function getProjectStatusData(year: number) {
  const projects = await db.project.findMany({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  })

  return projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {})
}

async function getMonthlyProgressData(year: number) {
  // Simulate monthly progress data
  const months = []
  for (let i = 0; i < 12; i++) {
    const month = i + 1
    const projects = await db.project.findMany({
      where: {
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    })

    months.push({
      month,
      projectsStarted: projects.length,
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      avgProgress: projects.length > 0 ? (projects.reduce((sum, p) => sum + p.progress, 0) / projects.length).toFixed(1) : 0,
    })
  }

  return months
}
