/**
 * Diaspora Management Module for African Nations
 * Track diaspora investments, remittances, and talent
 */

export interface DiasporaStats {
  country: string
  totalDiaspora: number
  totalRemittances: number
  totalInvestments: number
  topDestinations: string[]
  topSectors: string[]
  remittanceTrend: Array<{ year: number; amount: number }>
  investmentTrend: Array<{ year: number; amount: number }>
  returnRates: {
    remittanceReturn: number
    investmentReturn: number
  }
}

export const DIASPORA_DATA: Record<string, DiasporaStats> = {
  CM: {
    country: 'Cameroun',
    totalDiaspora: 2500000,
    totalRemittances: 2500000000,
    totalInvestments: 800000000,
    topDestinations: ['France', 'USA', 'UK', 'Germany', 'Canada'],
    topSectors: ['Real Estate', 'Agriculture', 'Healthcare', 'Technology', 'Education'],
    remittanceTrend: [
      { year: 2020, amount: 1800000000 },
      { year: 2021, amount: 2000000000 },
      { year: 2022, amount: 2200000000 },
      { year: 2023, amount: 2400000000 },
      { year: 2024, amount: 2500000000 },
    ],
    investmentTrend: [
      { year: 2020, amount: 400000000 },
      { year: 2021, amount: 500000000 },
      { year: 2022, amount: 600000000 },
      { year: 2023, amount: 700000000 },
      { year: 2024, amount: 800000000 },
    ],
    returnRates: {
      remittanceReturn: 15,
      investmentReturn: 25,
    },
  },
  CD: {
    country: 'RD Congo',
    totalDiaspora: 5000000,
    totalRemittances: 1200000000,
    totalInvestments: 400000000,
    topDestinations: ['Belgium', 'France', 'USA', 'UK', 'South Africa'],
    topSectors: ['Mining', 'Telecommunications', 'Agriculture', 'Energy', 'Real Estate'],
    remittanceTrend: [
      { year: 2020, amount: 800000000 },
      { year: 2021, amount: 900000000 },
      { year: 2022, amount: 950000000 },
      { year: 2023, amount: 1050000000 },
      { year: 2024, amount: 1200000000 },
    ],
    investmentTrend: [
      { year: 2020, amount: 200000000 },
      { year: 2021, amount: 250000000 },
      { year: 2022, amount: 300000000 },
      { year: 2023, amount: 350000000 },
      { year: 2024, amount: 400000000 },
    ],
    returnRates: {
      remittanceReturn: 12,
      investmentReturn: 30,
    },
  },
  GA: {
    country: 'Gabon',
    totalDiaspora: 300000,
    totalRemittances: 300000000,
    totalInvestments: 500000000,
    topDestinations: ['France', 'USA', 'UK', 'Canada', 'Senegal'],
    topSectors: ['Oil & Gas', 'Forestry', 'Tourism', 'Real Estate', 'Banking'],
    remittanceTrend: [
      { year: 2020, amount: 200000000 },
      { year: 2021, amount: 220000000 },
      { year: 2022, amount: 250000000 },
      { year: 2023, amount: 280000000 },
      { year: 2024, amount: 300000000 },
    ],
    investmentTrend: [
      { year: 2020, amount: 300000000 },
      { year: 2021, amount: 350000000 },
      { year: 2022, amount: 400000000 },
      { year: 2023, amount: 450000000 },
      { year: 2024, amount: 500000000 },
    ],
    returnRates: {
      remittanceReturn: 10,
      investmentReturn: 20,
    },
  },
  CG: {
    country: 'Congo Brazzaville',
    totalDiaspora: 500000,
    totalRemittances: 400000000,
    totalInvestments: 300000000,
    topDestinations: ['France', 'DRC', 'Belgium', 'USA', 'Canada'],
    topSectors: ['Oil & Gas', 'Agriculture', 'Forestry', 'Construction', 'Services'],
    remittanceTrend: [
      { year: 2020, amount: 300000000 },
      { year: 2021, amount: 320000000 },
      { year: 2022, amount: 350000000 },
      { year: 2023, amount: 380000000 },
      { year: 2024, amount: 400000000 },
    ],
    investmentTrend: [
      { year: 2020, amount: 150000000 },
      { year: 2021, amount: 180000000 },
      { year: 2022, amount: 220000000 },
      { year: 2023, amount: 260000000 },
      { year: 2024, amount: 300000000 },
    ],
    returnRates: {
      remittanceReturn: 11,
      investmentReturn: 22,
    },
  },
}

/**
 * Get diaspora stats for a country
 */
export function getDiasporaStats(countryCode: string): DiasporaStats | null {
  return DIASPORA_DATA[countryCode.toUpperCase()] || null
}

/**
 * Calculate economic impact of diaspora
 */
export function calculateDiasporaImpact(countryCode: string): {
  totalEconomicImpact: number
  perCapitaImpact: number
  gdpContribution: number
  jobCreationPotential: number
} {
  const stats = getDiasporaStats(countryCode)
  if (!stats) {
    return {
      totalEconomicImpact: 0,
      perCapitaImpact: 0,
      gdpContribution: 0,
      jobCreationPotential: 0,
    }
  }

  const totalEconomicImpact = stats.totalRemittances + stats.totalInvestments
  const perCapitaImpact = totalEconomicImpact / stats.totalDiaspora
  const gdpContribution = (totalEconomicImpact / (stats.totalDiaspora * 5000)) * 100
  const jobCreationPotential = Math.floor(stats.totalInvestments / 50000)

  return {
    totalEconomicImpact,
    perCapitaImpact,
    gdpContribution: Math.round(gdpContribution),
    jobCreationPotential,
  }
}

/**
 * Get diaspora engagement opportunities
 */
export function getEngagementOpportunities(countryCode: string): Array<{
  sector: string
  opportunity: string
  investmentPotential: string
  timeline: string
  riskLevel: 'Low' | 'Medium' | 'High'
}> {
  const stats = getDiasporaStats(countryCode)
  if (!stats) return []

  return stats.topSectors.map(sector => ({
    sector,
    opportunity: `Invest in ${sector} development projects`,
    investmentPotential: '$1M - $10M',
    timeline: '2-5 years',
    riskLevel: 'Medium' as const,
  }))
}
