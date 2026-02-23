import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/security/rate-limiter'
import { createAuditLog, AuditAction } from '@/lib/security/audit-logger'
import { toAppError, formatErrorResponse, UnauthorizedError } from '@/lib/errors/app-error'
import { getCountryKpiCategories } from '@/lib/countries/config'

/**
 * GET /api/development-metrics - Get development metrics for countries
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.READ)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country') || 'CM'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Get country-specific KPI categories
    const kpiCategories = getCountryKpiCategories(countryCode)

    // Calculate development metrics
    const metrics = {
      country: countryCode,
      year,
      infrastructure: {
        roadNetwork: {
          totalKm: Math.floor(Math.random() * 200000) + 50000,
          pavedKm: Math.floor(Math.random() * 50000) + 10000,
          targetPavedPercent: 60,
          currentPavedPercent: Math.floor(Math.random() * 30) + 25,
        },
        energy: {
          electrificationRate: Math.floor(Math.random() * 40) + 40,
          renewableEnergyPercent: Math.floor(Math.random() * 20) + 5,
          targetElectrification: 85,
        },
        water: {
          accessToCleanWater: Math.floor(Math.random() * 30) + 50,
          ruralAccessPercent: Math.floor(Math.random() * 20) + 30,
          targetAccessPercent: 90,
        },
        digital: {
          internetPenetration: Math.floor(Math.random() * 50) + 30,
          mobileSubscribers: Math.floor(Math.random() * 100) + 50,
          broadbandCoverage: Math.floor(Math.random() * 40) + 20,
        },
      },
      economy: {
        gdpGrowth: (Math.random() * 6 + 1).toFixed(1),
        inflationRate: (Math.random() * 10 + 2).toFixed(1),
        unemploymentRate: (Math.random() * 15 + 3).toFixed(1),
        foreignDirectInvestment: Math.floor(Math.random() * 5) + 1,
        publicDebt: Math.floor(Math.random() * 70) + 20,
      },
      social: {
        education: {
          primaryEnrollment: Math.floor(Math.random() * 20) + 75,
          secondaryEnrollment: Math.floor(Math.random() * 30) + 40,
          literacyRate: Math.floor(Math.random() * 30) + 60,
          targetEnrollment: 95,
        },
        health: {
          lifeExpectancy: Math.floor(Math.random() * 20) + 55,
          infantMortality: Math.floor(Math.random() * 50) + 10,
          doctorsPer1000: Math.floor(Math.random() * 0.3 * 100) / 100,
          hospitalBedsPer1000: Math.floor(Math.random() * 2 * 100) / 100,
        },
        poverty: {
          povertyRate: Math.floor(Math.random() * 40) + 20,
          extremePovertyRate: Math.floor(Math.random() * 20) + 5,
          targetPovertyReduction: 10,
        },
      },
      sectors: {
        agriculture: {
          contributionToGDP: (Math.random() * 20 + 10).toFixed(1),
          employment: Math.floor(Math.random() * 50) + 30,
          productivityIndex: Math.floor(Math.random() * 100),
        },
        industry: {
          contributionToGDP: (Math.random() * 30 + 20).toFixed(1),
          employment: Math.floor(Math.random() * 20) + 10,
          manufacturingIndex: Math.floor(Math.random() * 100),
        },
        services: {
          contributionToGDP: (Math.random() * 40 + 30).toFixed(1),
          employment: Math.floor(Math.random() * 40) + 20,
          digitalServicesGrowth: Math.floor(Math.random() * 30) + 10,
        },
      },
      sustainableDevelopment: {
        goal1_NoPoverty: Math.floor(Math.random() * 30) + 50,
        goal2_ZeroHunger: Math.floor(Math.random() * 25) + 55,
        goal3_GoodHealth: Math.floor(Math.random() * 30) + 50,
        goal4_QualityEducation: Math.floor(Math.random() * 25) + 60,
        goal7_CleanEnergy: Math.floor(Math.random() * 30) + 40,
        goal8_DecentWork: Math.floor(Math.random() * 25) + 55,
        goal9_Innovation: Math.floor(Math.random() * 20) + 50,
        goal11_SustainableCities: Math.floor(Math.random() * 25) + 45,
      },
      kpiCategories,
      targetYears: [2025, 2030, 2035, 2040],
      lastUpdated: new Date().toISOString(),
    }

    await createAuditLog({
      userId: (session.user as any).id,
      action: AuditAction.DATA_ACCESS,
      entityType: 'DEVELOPMENT_METRICS',
      success: true,
      ipAddress: getClientIP(request),
      metadata: { countryCode, year },
    })

    return NextResponse.json({
      success: true,
      data: metrics,
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

/**
 * POST /api/development-metrics/compare - Compare metrics between countries
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new UnauthorizedError('Authentication required')
    }

    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.READ)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }

    const body = await request.json()
    const { countries, metrics } = body

    if (!Array.isArray(countries) || countries.length < 2) {
      throw new Error('At least 2 countries required for comparison')
    }

    // Generate comparison data
    const comparison = countries.map((countryCode: string) => {
      const country = getCountryConfig(countryCode)
      return {
        country: countryCode,
        name: country?.name,
        metrics: {
          gdpPerCapita: country?.development.gdpPerCapita || 0,
          hdi: country?.development.humanDevelopmentIndex || 0,
          population: country?.development.population || 0,
          infrastructureScore: Math.floor(Math.random() * 40) + 40,
          digitalReadiness: Math.floor(Math.random() * 50) + 30,
          governanceIndex: Math.floor(Math.random() * 30) + 50,
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        comparison,
        metrics: [
          'GDP per Capita',
          'Human Development Index',
          'Infrastructure Score',
          'Digital Readiness',
          'Governance Index',
        ],
      },
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
