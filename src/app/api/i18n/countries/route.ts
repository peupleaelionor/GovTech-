import { NextRequest, NextResponse } from 'next/server'
import { getCountryConfig, getSupportedCountries, getSupportedLanguages } from '@/lib/i18n/config'

/**
 * GET /api/i18n/countries - Get supported countries
 */
export async function GET(request: NextRequest) {
  try {
    const countries = getSupportedCountries()
    const countryConfigs = countries.map(code => getCountryConfig(code))

    return NextResponse.json({
      success: true,
      data: countryConfigs,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get countries' },
      { status: 500 }
    )
  }
}
