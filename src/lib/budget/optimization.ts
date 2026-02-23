/**
 * Budget Optimization Module for African Governments
 * Focus on debt management, resource allocation, and efficiency
 */

export interface BudgetOptimization {
  country: string
  year: number
  totalBudget: number
  allocations: {
    education: { amount: number; percent: number; efficiency: number }
    healthcare: { amount: number; percent: number; efficiency: number }
    infrastructure: { amount: number; percent: number; efficiency: number }
    defense: { amount: number; percent: number; efficiency: number }
    socialProtection: { amount: number; percent: number; efficiency: number }
    other: { amount: number; percent: number; efficiency: number }
  }
  debt: {
    totalDebt: number
    debtToGDPRatio: number
    debtService: number
    debtServiceToRevenue: number
    externalDebt: number
    domesticDebt: number
  }
  optimization: {
    potentialSavings: number
    inefficientAreas: Array<{
      sector: string
      currentEfficiency: number
      targetEfficiency: number
      potentialSavings: number
      recommendations: string[]
    }>
    reallocationOpportunities: Array<{
      from: string
      to: string
      amount: number
      reason: string
    }>
  }
  performance: {
    budgetExecutionRate: number
    costRecovery: number
    publicInvestmentEfficiency: number
  }
}

export const BUDGET_OPTIMIZATION_DATA: Record<string, BudgetOptimization> = {
  CM: {
    country: 'Cameroun',
    year: 2024,
    totalBudget: 7500000000000,
    allocations: {
      education: { amount: 900000000000, percent: 12, efficiency: 72 },
      healthcare: { amount: 825000000000, percent: 11, efficiency: 68 },
      infrastructure: { amount: 1875000000000, percent: 25, efficiency: 78 },
      defense: { amount: 975000000000, percent: 13, efficiency: 65 },
      socialProtection: { amount: 1125000000000, percent: 15, efficiency: 70 },
      other: { amount: 1800000000000, percent: 24, efficiency: 62 },
    },
    debt: {
      totalDebt: 18000000000000,
      debtToGDPRatio: 42,
      debtService: 1200000000000,
      debtServiceToRevenue: 18,
      externalDebt: 12000000000000,
      domesticDebt: 6000000000000,
    },
    optimization: {
      potentialSavings: 450000000000,
      inefficientAreas: [
        {
          sector: 'Other',
          currentEfficiency: 62,
          targetEfficiency: 75,
          potentialSavings: 234000000000,
          recommendations: [
            'Reduce administrative overhead by 20%',
            'Consolidate redundant programs',
            'Implement digital governance',
            'Optimize procurement processes',
          ],
        },
        {
          sector: 'Defense',
          currentEfficiency: 65,
          targetEfficiency: 80,
          potentialSavings: 216000000000,
          recommendations: [
            'Modernize military equipment',
            'Reduce unnecessary procurement',
            'Improve logistics and supply chain',
            'Implement efficient training programs',
          ],
        },
      ],
      reallocationOpportunities: [
        {
          from: 'Other',
          to: 'Education',
          amount: 150000000000,
          reason: 'Improve education quality and access',
        },
        {
          from: 'Defense',
          to: 'Healthcare',
          amount: 100000000000,
          reason: 'Enhance healthcare infrastructure',
        },
      ],
    },
    performance: {
      budgetExecutionRate: 78,
      costRecovery: 65,
      publicInvestmentEfficiency: 71,
    },
  },
  CD: {
    country: 'RD Congo',
    year: 2024,
    totalBudget: 15000000000000,
    allocations: {
      education: { amount: 1800000000000, percent: 12, efficiency: 58 },
      healthcare: { amount: 1650000000000, percent: 11, efficiency: 55 },
      infrastructure: { amount: 3750000000000, percent: 25, efficiency: 62 },
      defense: { amount: 2250000000000, percent: 15, efficiency: 50 },
      socialProtection: { amount: 1500000000000, percent: 10, efficiency: 52 },
      other: { amount: 4050000000000, percent: 27, efficiency: 45 },
    },
    debt: {
      totalDebt: 12000000000000,
      debtToGDPRatio: 35,
      debtService: 800000000000,
      debtServiceToRevenue: 12,
      externalDebt: 9000000000000,
      domesticDebt: 3000000000000,
    },
    optimization: {
      potentialSavings: 900000000000,
      inefficientAreas: [
        {
          sector: 'Other',
          currentEfficiency: 45,
          targetEfficiency: 70,
          potentialSavings: 486000000000,
          recommendations: [
            'Reduce corruption through digital systems',
            'Implement transparent procurement',
            'Consolidate overlapping agencies',
            'Automate revenue collection',
          ],
        },
        {
          sector: 'Defense',
          currentEfficiency: 50,
          targetEfficiency: 75,
          potentialSavings: 337500000000,
          recommendations: [
            'Modernize armed forces',
            'Reduce ghost soldiers',
            'Improve logistics efficiency',
            'Implement better asset management',
          ],
        },
      ],
      reallocationOpportunities: [
        {
          from: 'Other',
          to: 'Infrastructure',
          amount: 300000000000,
          reason: 'Accelerate infrastructure development',
        },
        {
          from: 'Defense',
          to: 'Healthcare',
          amount: 200000000000,
          reason: 'Improve public health services',
        },
      ],
    },
    performance: {
      budgetExecutionRate: 65,
      costRecovery: 52,
      publicInvestmentEfficiency: 58,
    },
  },
  GA: {
    country: 'Gabon',
    year: 2024,
    totalBudget: 5000000000000,
    allocations: {
      education: { amount: 500000000000, percent: 10, efficiency: 80 },
      healthcare: { amount: 600000000000, percent: 12, efficiency: 82 },
      infrastructure: { amount: 1500000000000, percent: 30, efficiency: 85 },
      defense: { amount: 500000000000, percent: 10, efficiency: 78 },
      socialProtection: { amount: 900000000000, percent: 18, efficiency: 76 },
      other: { amount: 1000000000000, percent: 20, efficiency: 72 },
    },
    debt: {
      totalDebt: 15000000000000,
      debtToGDPRatio: 78,
      debtService: 800000000000,
      debtServiceToRevenue: 25,
      externalDebt: 10000000000000,
      domesticDebt: 5000000000000,
    },
    optimization: {
      potentialSavings: 150000000000,
      inefficientAreas: [
        {
          sector: 'Other',
          currentEfficiency: 72,
          targetEfficiency: 85,
          potentialSavings: 65000000000,
          recommendations: [
            'Streamline administrative processes',
            'Implement e-government solutions',
            'Optimize public sector wages',
            'Reduce redundant positions',
          ],
        },
      ],
      reallocationOpportunities: [
        {
          from: 'Other',
          to: 'Healthcare',
          amount: 75000000000,
          reason: 'Enhance healthcare capacity',
        },
      ],
    },
    performance: {
      budgetExecutionRate: 85,
      costRecovery: 75,
      publicInvestmentEfficiency: 82,
    },
  },
  CG: {
    country: 'Congo Brazzaville',
    year: 2024,
    totalBudget: 8000000000000,
    allocations: {
      education: { amount: 800000000000, percent: 10, efficiency: 70 },
      healthcare: { amount: 960000000000, percent: 12, efficiency: 68 },
      infrastructure: { amount: 2400000000000, percent: 30, efficiency: 75 },
      defense: { amount: 960000000000, percent: 12, efficiency: 60 },
      socialProtection: { amount: 1120000000000, percent: 14, efficiency: 65 },
      other: { amount: 1760000000000, percent: 22, efficiency: 58 },
    },
    debt: {
      totalDebt: 12000000000000,
      debtToGDPRatio: 85,
      debtService: 700000000000,
      debtServiceToRevenue: 22,
      externalDebt: 8000000000000,
      domesticDebt: 4000000000000,
    },
    optimization: {
      potentialSavings: 250000000000,
      inefficientAreas: [
        {
          sector: 'Other',
          currentEfficiency: 58,
          targetEfficiency: 75,
          potentialSavings: 119000000000,
          recommendations: [
            'Reduce government overhead',
            'Implement digital transformation',
            'Optimize public spending',
            'Improve procurement efficiency',
          ],
        },
        {
          sector: 'Defense',
          currentEfficiency: 60,
          targetEfficiency: 75,
          potentialSavings: 96000000000,
          recommendations: [
            'Modernize military capabilities',
            'Reduce inefficiencies in procurement',
            'Improve asset management',
            'Optimize training programs',
          },
        },
      ],
      reallocationOpportunities: [
        {
          from: 'Other',
          to: 'Education',
          amount: 100000000000,
          reason: 'Improve education system',
        },
        {
          from: 'Defense',
          to: 'Healthcare',
          amount: 75000000000,
          reason: 'Enhance healthcare services',
        },
      ],
    },
    performance: {
      budgetExecutionRate: 72,
      costRecovery: 62,
      publicInvestmentEfficiency: 68,
    },
  },
}

/**
 * Get budget optimization data for a country
 */
export function getBudgetOptimization(countryCode: string): BudgetOptimization | null {
  return BUDGET_OPTIMIZATION_DATA[countryCode.toUpperCase()] || null
}

/**
 * Calculate debt sustainability metrics
 */
export function calculateDebtSustainability(countryCode: string): {
  isSustainable: boolean
  debtRatio: 'Low' | 'Medium' | 'High' | 'Critical'
  riskLevel: 'Low' | 'Medium' | 'High'
  recommendations: string[]
} {
  const data = getBudgetOptimization(countryCode)
  if (!data) {
    return {
      isSustainable: false,
      debtRatio: 'Critical',
      riskLevel: 'High',
      recommendations: [],
    }
  }

  const debtToGDP = data.debt.debtToGDPRatio
  const debtServiceRatio = data.debt.debtServiceToRevenue

  let debtRatio: 'Low' | 'Medium' | 'High' | 'Critical'
  let riskLevel: 'Low' | 'Medium' | 'High'
  let isSustainable = true
  const recommendations: string[] = []

  if (debtToGDP < 40) {
    debtRatio = 'Low'
    riskLevel = 'Low'
  } else if (debtToGDP < 60) {
    debtRatio = 'Medium'
    riskLevel = 'Medium'
    recommendations.push('Monitor debt levels closely')
  } else if (debtToGDP < 80) {
    debtRatio = 'High'
    riskLevel = 'High'
    isSustainable = false
    recommendations.push('Implement debt reduction strategy')
    recommendations.push('Consider debt restructuring')
  } else {
    debtRatio = 'Critical'
    riskLevel = 'High'
    isSustainable = false
    recommendations.push('Immediate debt restructuring required')
    recommendations.push('Seek IMF assistance')
    recommendations.push('Implement austerity measures')
  }

  if (debtServiceRatio > 20) {
    recommendations.push('Debt service burden too high - need revenue increase or debt relief')
    riskLevel = 'High'
    isSustainable = false
  }

  if (isSustainable) {
    recommendations.push('Maintain current debt management practices')
    recommendations.push('Continue prudent borrowing')
  }

  return { isSustainable, debtRatio, riskLevel, recommendations }
}

/**
 * Get budget efficiency recommendations
 */
export function getEfficiencyRecommendations(countryCode: string): Array<{
  category: string
  currentScore: number
  targetScore: number
  gap: number
  actions: string[]
  expectedSavings: number
  timeframe: string
}> {
  const data = getBudgetOptimization(countryCode)
  if (!data) return []

  return Object.entries(data.allocations).map(([sector, info]) => ({
    category: sector.charAt(0).toUpperCase() + sector.slice(1),
    currentScore: info.efficiency,
    targetScore: Math.min(90, info.efficiency + 15),
    gap: Math.min(90, info.efficiency + 15) - info.efficiency,
    actions: [
      `Implement digital transformation in ${sector}`,
      `Automate ${sector} processes`,
      `Improve ${sector} procurement`,
      `Enhance ${sector} monitoring and evaluation`,
      `Train ${sector} personnel`,
    ],
    expectedSavings: Math.floor(info.amount * (0.15 - (info.efficiency / 1000))),
    timeframe: '12-24 months',
  })).filter(rec => rec.gap > 5)
}
