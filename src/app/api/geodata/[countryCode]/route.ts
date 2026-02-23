import { NextRequest, NextResponse } from 'next/server'
import { getCountryConfig, CountryCode } from '@/lib/i18n/config'

/**
 * GET /api/geodata/[countryCode] - Get geographical data for a country
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { countryCode: string } }
) {
  try {
    const countryCode = params.countryCode.toUpperCase() as CountryCode
    const country = getCountryConfig(countryCode)

    // Return geographical data
    const geoData = {
      country: {
        code: countryCode,
        name: country.name,
        currency: country.currency,
        currencySymbol: country.currencySymbol,
        capital: getCapitalCity(countryCode),
        coordinates: getCountryCoordinates(countryCode),
        borders: getCountryBorders(countryCode),
      },
      regions: country.regions.map((region, index) => ({
        name: region,
        id: `${countryCode.toLowerCase()}-${index + 1}`,
        coordinates: generateRegionCoordinates(countryCode, index),
        center: getRegionCenter(countryCode, index),
        population: generateRegionPopulation(countryCode, index),
      })),
      cities: getMajorCities(countryCode),
      infrastructure: getInfrastructurePoints(countryCode),
      statistics: getCountryStatistics(countryCode),
    }

    return NextResponse.json({
      success: true,
      data: geoData,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get geographical data' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/geodata/[countryCode]/projects - Get project locations on map
 */
export async function getProjects(
  request: NextRequest,
  { params }: { params: { countryCode: string } }
) {
  try {
    const { db } = await import('@/lib/db')
    const countryCode = params.countryCode.toUpperCase()

    const projects = await db.project.findMany({
      include: {
        ministry: { select: { name: true, code: true } },
        manager: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Add coordinates to projects (simulated - in production, this would come from actual location data)
    const projectsWithGeo = projects.map((project, index) => ({
      ...project,
      coordinates: generateProjectCoordinates(countryCode, index),
      region: project.ministry?.code || 'UNKNOWN',
    }))

    return NextResponse.json({
      success: true,
      data: {
        projects: projectsWithGeo,
        total: projectsWithGeo.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get project locations' },
      { status: 500 }
    )
  }
}

// Helper functions for geographical data

function getCapitalCity(countryCode: CountryCode): string {
  const capitals: Record<countryCode, string> = {
    CM: 'Yaoundé',
    CD: 'Kinshasa',
    GA: 'Libreville',
    CG: 'Brazzaville',
    CI: 'Yamoussoukro',
    SN: 'Dakar',
    NG: 'Abuja',
    KE: 'Nairobi',
    ZA: 'Pretoria',
    MA: 'Rabat',
    DZ: 'Alger',
    EG: 'Le Caire',
  }
  return capitals[countryCode] || 'Unknown'
}

function getCountryCoordinates(countryCode: CountryCode): [number, number] {
  const coordinates: Record<CountryCode, [number, number]> = {
    CM: [3.8488, 11.5021],
    CD: [-4.4419, 15.2663],
    GA: [-0.8021, 9.3079],
    CG: [-4.2634, 15.2429],
    CI: [-5.5471, 7.5415],
    SN: [-14.4524, 14.4974],
    NG: [7.4896, 9.0579],
    KE: [-0.0236, 37.9062],
    ZA: [-25.7479, 28.2273],
    MA: [-7.0926, 31.7917],
    DZ: [1.6596, 28.0339],
    EG: [26.8206, 30.8025],
  }
  return coordinates[countryCode] || [0, 0]
}

function getCountryBorders(countryCode: CountryCode): string[] {
  const borders: Record<CountryCode, string[]> = {
    CM: ['NG', 'GA', 'CG', 'CF', 'TD'],
    CD: ['CG', 'CF', 'SD', 'UG', 'RW', 'BI', 'TZ', 'ZM', 'AO'],
    GA: ['CM', 'CG'],
    CG: ['GA', 'CM', 'CD', 'CF', 'AO'],
    CI: ['ML', 'GN', 'LR', 'GH', 'BF'],
    SN: ['MR', 'ML', 'GN', 'GU-B', 'GM'],
    NG: ['NE', 'TD', 'CM', 'Benin', 'Niger'],
    KE: ['SO', 'ET', 'UG', 'TZ', 'SS', 'SD'],
    ZA: ['NA', 'BW', 'ZW', 'MZ', 'SZ', 'LS'],
    MA: ['DZ', 'EH', 'MR'],
    DZ: ['TN', 'LY', 'MR', 'ML', 'NE', 'TD', 'LY', 'NE'],
    EG: ['LY', 'SD'],
  }
  return borders[countryCode] || []
}

function generateRegionCoordinates(countryCode: CountryCode, regionIndex: number): [number, number] {
  const countryCenter = getCountryCoordinates(countryCode)
  const offset = (regionIndex - Math.floor(12 / 2)) * 0.5
  return [
    countryCenter[0] + offset,
    countryCenter[1] + offset,
  ]
}

function getRegionCenter(countryCode: CountryCode, regionIndex: number): [number, number] {
  return generateRegionCoordinates(countryCode, regionIndex)
}

function generateRegionPopulation(countryCode: CountryCode, regionIndex: number): number {
  // Simulated population data (in millions)
  const basePopulations: Record<CountryCode, number[]> = {
    CM: [4.5, 3.8, 2.9, 2.6, 3.2, 4.1, 3.9, 3.0, 2.8, 3.5],
    CD: [12.5, 8.3, 4.2, 3.8, 5.1, 6.2, 4.8, 5.5, 3.9, 4.5],
    GA: [0.8, 0.6, 0.4, 0.5, 0.3, 0.4, 0.5, 0.4, 0.3, 0.4],
    CG: [2.5, 1.8, 1.2, 0.9, 1.5, 2.0, 1.6, 1.8, 1.2, 1.4],
  }
  
  const pops = basePopulations[countryCode]
  return pops ? pops[regionIndex % pops.length] : 1.0
}

function getMajorCities(countryCode: CountryCode) {
  const cities: Record<CountryCode, any[]> = {
    CM: [
      { name: 'Douala', coordinates: [4.0483, 9.7043], population: 2.8 },
      { name: 'Yaoundé', coordinates: [3.8788, 11.5021], population: 2.9 },
      { name: 'Garoua', coordinates: [10.4154, 14.3324], population: 0.6 },
      { name: 'Bafoussam', coordinates: [5.4834, 10.4175], population: 0.4 },
      { name: 'Bamenda', coordinates: [5.9631, 10.1596], population: 0.5 },
    ],
    CD: [
      { name: 'Kinshasa', coordinates: [-4.4419, 15.2663], population: 11.8 },
      { name: 'Lubumbashi', coordinates: [-11.6602, 27.4796], population: 2.6 },
      { name: 'Mbuji-Mayi', coordinates: [-23.4734, 20.8177], population: 2.5 },
      { name: 'Kisangani', coordinates: [-25.1912, 20.6328], population: 1.4 },
      { name: 'Bukavu', coordinates: [-2.5121, 28.8516], population: 1.1 },
    ],
    GA: [
      { name: 'Libreville', coordinates: [0.3924, 9.4556], population: 0.7 },
      { name: 'Port-Gentil', coordinates: [0.7167, 9.4667], population: 0.15 },
      { name: 'Franceville', coordinates: [-0.6667, 10.4167], population: 0.12 },
      { name: 'Oyem', coordinates: [11.5833, 11.0833], population: 0.06 },
      { name: 'Moanda', coordinates: [11.5833, 13.4333], population: 0.05 },
    ],
    CG: [
      { name: 'Brazzaville', coordinates: [-4.2634, 15.2429], population: 1.7 },
      { name: 'Pointe-Noire', coordinates: [5.5329, -4.7484], population: 0.8 },
      { name: 'Dolisie', coordinates: [-2.0222, 14.4167], population: 0.4 },
      { name: 'Nkayi', coordinates: [-4.1667, 14.4167], population: 0.12 },
      { name: 'Kindamba', coordinates: [-13.7167, -12.5333], population: 0.1 },
    ],
    CI: [
      { name: 'Abidjan', coordinates: [-5.3595, 6.3131], population: 4.8 },
      { name: 'Bouaké', coordinates: [-7.6667, 7.7167], population: 0.7 },
      { name: 'Yamoussoukro', coordinates: [-5.5471, 7.5415], population: 0.3 },
      { name: 'San-Pédro', coordinates: [-6.6333, 5.7167], population: 0.2 },
      { name: 'Korhogo', coordinates: [-7.3667, 8.0167], population: 0.2 },
    ],
    SN: [
      { name: 'Dakar', coordinates: [-14.4524, 14.4974], population: 1.1 },
      { name: 'Touba', coordinates: [-16.9411, 14.7178], population: 0.7 },
      { name: 'Thiès', coordinates: [-16.9239, 14.7795], population: 0.4 },
      { name: 'Kaolack', coordinates: [-14.1464, 14.6712], population: 0.3 },
      { name: 'Ziguinchor', coordinates: [-16.6489, -1.9506], population: 0.3 },
    ],
    NG: [
      { name: 'Lagos', coordinates: [6.5244, 3.3792], population: 14.4 },
      { name: 'Kano', coordinates: [8.5172, 12.0022], population: 4.0 },
      { name: 'Ibadan', coordinates: [7.3775, 3.9470], population: 3.6 },
      { name: 'Abuja', coordinates: [7.4896, 9.0579], population: 1.2 },
      { name: 'Port Harcourt', coordinates: [7.0130, 4.7770], population: 1.0 },
    ],
    KE: [
      { name: 'Nairobi', coordinates: [-0.0236, 37.9062], population: 4.4 },
      { name: 'Mombasa', coordinates: [-4.0435, 39.6682], population: 1.2 },
      { name: 'Kisumu', coordinates: [-0.0917, -34.7676], population: 0.6 },
      { name: 'Nakuru', coordinates: [-0.2833, 36.0667], population: 0.4 },
      { name: 'Eldoret', coordinates: [0.0944, 35.2833], population: 0.4 },
    ],
    ZA: [
      { name: 'Johannesburg', coordinates: [-26.2041, 28.0473], population: 4.4 },
      { name: 'Cape Town', coordinates: [-33.9249, 18.4241], population: 3.7 },
      { name: 'Durban', coordinates: [-29.8587, 31.0218], population: 3.1 },
      { name: 'Pretoria', coordinates: [-25.7479, 28.2273], population: 2.9 },
      { name: 'Port Elizabeth', coordinates: [-33.9608, 25.6022], population: 1.2 },
    ],
    MA: [
      { name: 'Casablanca', coordinates: [33.5731, -7.5898], population: 3.3 },
      { name: 'Fès', coordinates: [34.0331, -5.0003], population: 1.2 },
      { name: 'Marrakech', coordinates: [31.6295, -7.9811], population: 1.1 },
      { name: 'Tanger', coordinates: [35.7595, -5.8340], population: 0.9 },
      { name: 'Agadir', coordinates: [30.4278, -9.5981], population: 0.6 },
    ],
    DZ: [
      { name: 'Alger', coordinates: [36.7538, 3.0588], population: 2.6 },
      { name: 'Oran', coordinates: [35.6911, -0.6417], population: 0.9 },
      { name: 'Constantine', coordinates: [36.3650, 6.6147], population: 0.8 },
      { name: 'Annaba', coordinates: [36.8947, 7.7775], population: 0.6 },
      { name: 'Blida', coordinates: [36.7725, 3.0497], population: 0.5 },
    ],
    EG: [
      { name: 'Cairo', coordinates: [30.0444, 31.2357], population: 9.5 },
      { name: 'Alexandria', coordinates: [31.2001, 29.9187], population: 4.5 },
      { name: 'Giza', coordinates: [30.0131, 31.2083], population: 3.6 },
      { name: 'Shubra El-Kheima', coordinates: [30.1275, 31.3278], population: 1.2 },
      { name: 'Mansoura', coordinates: [31.3785, 31.0379], population: 0.5 },
    ],
  }

  return cities[countryCode] || []
}

function getInfrastructurePoints(countryCode: CountryCode) {
  // Simulated infrastructure points
  const cities = getMajorCities(countryCode)
  
  return cities.map(city => ({
    name: `${city.name} International Airport`,
    type: 'airport',
    coordinates: city.coordinates,
    status: 'operational',
  }))
}

function getCountryStatistics(countryCode: CountryCode) {
  // Simulated statistics
  const stats: Record<CountryCode, any> = {
    CM: {
      population: 27.2, // millions
      gdp: 44.3, // billions USD
      gdpPerCapita: 1629,
      literacyRate: 77.1,
      internetPenetration: 42.0,
      mobilePenetration: 85.0,
    },
    CD: {
      population: 95.9,
      gdp: 55.4,
      gdpPerCapita: 578,
      literacyRate: 77.0,
      internetPenetration: 19.7,
      mobilePenetration: 42.0,
    },
    GA: {
      population: 2.2,
      gdp: 18.7,
      gdpPerCapita: 8500,
      literacyRate: 83.2,
      internetPenetration: 62.0,
      mobilePenetration: 95.0,
    },
    CG: {
      population: 5.5,
      gdp: 14.1,
      gdpPerCapita: 2564,
      literacyRate: 80.2,
      internetPenetration: 9.0,
      mobilePenetration: 90.0,
    },
    CI: {
      population: 27.5,
      gdp: 58.7,
      gdpPerCapita: 2134,
      literacyRate: 47.2,
      internetPenetration: 39.9,
      mobilePenetration: 125.0,
    },
    SN: {
      population: 17.3,
      gdp: 27.9,
      gdpPerCapita: 1613,
      literacyRate: 53.8,
      internetPenetration: 58.0,
      mobilePenetration: 92.0,
    },
    NG: {
      population: 213.4,
      gdp: 432.3,
      gdpPerCapita: 2026,
      literacyRate: 62.0,
      internetPenetration: 36.0,
      mobilePenetration: 84.5,
    },
    KE: {
      population: 53.0,
      gdp: 110.3,
      gdpPerCapita: 2082,
      literacyRate: 81.5,
      internetPenetration: 85.0,
      mobilePenetration: 119.0,
    },
    ZA: {
      population: 60.0,
      gdp: 351.4,
      gdpPerCapita: 5857,
      literacyRate: 87.0,
      internetPenetration: 68.0,
      mobilePenetration: 149.0,
    },
    MA: {
      population: 36.9,
      gdp: 130.4,
      gdpPerCapita: 3536,
      literacyRate: 76.1,
      internetPenetration: 84.0,
      mobilePenetration: 135.0,
    },
    DZ: {
      population: 44.2,
      gdp: 183.7,
      gdpPerCapita: 4157,
      literacyRate: 80.2,
      internetPenetration: 71.0,
      mobilePenetration: 112.0,
    },
    EG: {
      population: 104.3,
      gdp: 462.5,
      gdpPerCapita: 4435,
      literacyRate: 71.2,
      internetPenetration: 72.0,
      mobilePenetration: 105.0,
    },
  }

  return stats[countryCode] || {
    population: 0,
    gdp: 0,
    gdpPerCapita: 0,
    literacyRate: 0,
    internetPenetration: 0,
    mobilePenetration: 0,
  }
}

function generateProjectCoordinates(countryCode: CountryCode, index: number): [number, number] {
  const center = getCountryCoordinates(countryCode)
  const angle = (index / 10) * Math.PI * 2
  const radius = 0.5 // degrees
  
  return [
    center[0] + radius * Math.cos(angle),
    center[1] + radius * Math.sin(angle),
  ]
}
