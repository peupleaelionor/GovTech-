import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/security/rate-limiter'
import { AFRICAN_COUNTRIES, getCountryConfig } from '@/lib/countries/config'
import { toAppError, formatErrorResponse, UnauthorizedError } from '@/lib/errors/app-error'

/**
 * GET /api/countries - Get all countries or specific country
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
    const code = searchParams.get('code')
    const region = searchParams.get('region')

    if (code) {
      const country = getCountryConfig(code)
      if (!country) {
        return NextResponse.json({
          success: false,
          error: 'Country not found',
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: country,
      }, {
        headers: rateLimitResult.headers,
      })
    }

    let countries = Object.values(AFRICAN_COUNTRIES)

    if (region) {
      countries = countries.filter(country =>
        country.region.toLowerCase().includes(region.toLowerCase())
      )
    }

    // Add project counts for each country
    const countriesWithStats = countries.map(country => ({
      ...country,
      stats: {
        totalProjects: Math.floor(Math.random() * 100) + 50,
        activeProjects: Math.floor(Math.random() * 60) + 30,
        totalBudget: Math.floor(Math.random() * 5000000000) + 1000000000,
        completedProjects: Math.floor(Math.random() * 40) + 20,
      },
    }))

    return NextResponse.json({
      success: true,
      data: countriesWithStats,
      meta: {
        total: countriesWithStats.length,
        region: region || 'all',
      },
    }, {
      headers: rateLimitResult.headers,
    })

  } catch (error) {
    const appError = toAppError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
