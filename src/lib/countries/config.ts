/**
 * Country Configuration for African Nations
 * Specific data for Cameroon, DRC, Gabon, Congo Brazzaville and others
 */

export interface CountryConfig {
  code: string
  name: string
  nameEn: string
  nameFr: string
  nameLocal: string
  currency: {
    code: string
    symbol: string
    name: string
    subunit: string
  }
  languages: {
    official: string[]
    working: string[]
  }
  timezone: string
  region: string
  callingCode: string
  government: {
    capital: string
    presidentTitle: string
    system: string
  }
  development: {
    gdpPerCapita: number
    population: number
    humanDevelopmentIndex: number
  }
  sectors: {
    priority: string[]
    keyIndustries: string[]
  }
  kpiCategories: string[]
}

export const AFRICAN_COUNTRIES: Record<string, CountryConfig> = {
  CM: {
    code: 'CM',
    name: 'Cameroun',
    nameEn: 'Cameroon',
    nameFr: 'Cameroun',
    nameLocal: 'Cameroun',
    currency: {
      code: 'XAF',
      symbol: 'FCFA',
      name: 'Central African CFA Franc',
      subunit: 'centime',
    },
    languages: {
      official: ['fr', 'en'],
      working: ['fr', 'en'],
    },
    timezone: 'Africa/Douala',
    region: 'Central Africa',
    callingCode: '+237',
    government: {
      capital: 'Yaoundé',
      presidentTitle: 'Président de la République',
      system: 'Presidential Republic',
    },
    development: {
      gdpPerCapita: 1660,
      population: 27900000,
      humanDevelopmentIndex: 0.765,
    },
    sectors: {
      priority: ['infrastructure', 'energy', 'agriculture', 'education', 'healthcare'],
      keyIndustries: ['oil', 'gas', 'agriculture', 'forestry', 'mining'],
    },
    kpiCategories: [
      'Infrastructure Development',
      'Energy Access',
      'Agricultural Production',
      'Education Access',
      'Healthcare Coverage',
      'Road Network',
      'Digital Infrastructure',
      'Water Supply',
    ],
  },
  CD: {
    code: 'CD',
    name: 'RD Congo',
    nameEn: 'Democratic Republic of the Congo',
    nameFr: 'République Démocratique du Congo',
    nameLocal: 'Repubilika ya Kongo ya Dimokalasi',
    currency: {
      code: 'CDF',
      symbol: 'FC',
      name: 'Congolese Franc',
      subunit: 'centime',
    },
    languages: {
      official: ['fr'],
      working: ['fr', 'sw', 'ln', 'kg'],
    },
    timezone: 'Africa/Kinshasa',
    region: 'Central Africa',
    callingCode: '+243',
    government: {
      capital: 'Kinshasa',
      presidentTitle: 'Président de la République',
      system: 'Presidential Republic',
    },
    development: {
      gdpPerCapita: 578,
      population: 95890000,
      humanDevelopmentIndex: 0.579,
    },
    sectors: {
      priority: ['mining', 'infrastructure', 'energy', 'agriculture', 'healthcare'],
      keyIndustries: ['cobalt', 'copper', 'diamonds', 'oil', 'timber'],
    },
    kpiCategories: [
      'Mining Production',
      'Energy Generation',
      'Road Infrastructure',
      'Healthcare Access',
      'Education Enrollment',
      'Water Supply',
      'Electricity Access',
      'Agricultural Output',
    ],
  },
  GA: {
    code: 'GA',
    name: 'Gabon',
    nameEn: 'Gabon',
    nameFr: 'Gabon',
    nameLocal: 'Gabon',
    currency: {
      code: 'XAF',
      symbol: 'FCFA',
      name: 'Central African CFA Franc',
      subunit: 'centime',
    },
    languages: {
      official: ['fr'],
      working: ['fr'],
    },
    timezone: 'Africa/Libreville',
    region: 'Central Africa',
    callingCode: '+241',
    government: {
      capital: 'Libreville',
      presidentTitle: 'Président de la République',
      system: 'Presidential Republic',
    },
    development: {
      gdpPerCapita: 8660,
      population: 2300000,
      humanDevelopmentIndex: 0.803,
    },
    sectors: {
      priority: ['oil', 'gas', 'mining', 'forestry', 'tourism'],
      keyIndustries: ['oil', 'manganese', 'timber', 'uranium'],
    },
    kpiCategories: [
      'Oil Production',
      'Gas Extraction',
      'Forestry Management',
      'Mining Output',
      'Economic Diversification',
      'Environmental Protection',
      'Tourism Development',
      'Infrastructure Quality',
    ],
  },
  CG: {
    code: 'CG',
    name: 'Congo Brazzaville',
    nameEn: 'Republic of the Congo',
    nameFr: 'République du Congo',
    nameLocal: 'Repubilika ya Kongo',
    currency: {
      code: 'XAF',
      symbol: 'FCFA',
      name: 'Central African CFA Franc',
      subunit: 'centime',
    },
    languages: {
      official: ['fr'],
      working: ['fr', 'ln', 'kg'],
    },
    timezone: 'Africa/Brazzaville',
    region: 'Central Africa',
    callingCode: '+242',
    government: {
      capital: 'Brazzaville',
      presidentTitle: 'Président de la République',
      system: 'Presidential Republic',
    },
    development: {
      gdpPerCapita: 2450,
      population: 5900000,
      humanDevelopmentIndex: 0.728,
    },
    sectors: {
      priority: ['oil', 'forestry', 'agriculture', 'manufacturing', 'services'],
      keyIndustries: ['oil', 'timber', 'agriculture', 'potash', 'magnesium'],
    },
    kpiCategories: [
      'Oil & Gas Production',
      'Forestry Management',
      'Agricultural Development',
      'Manufacturing Growth',
      'Service Sector',
      'Infrastructure Development',
      'Energy Distribution',
      'Urban Development',
    ],
  },
  CI: {
    code: 'CI',
    name: 'Côte d\'Ivoire',
    nameEn: 'Ivory Coast',
    nameFr: 'Côte d\'Ivoire',
    nameLocal: 'Côte d\'Ivoire',
    currency: {
      code: 'XOF',
      symbol: 'FCFA',
      name: 'West African CFA Franc',
      subunit: 'centime',
    },
    languages: {
      official: ['fr'],
      working: ['fr'],
    },
    timezone: 'Africa/Abidjan',
    region: 'West Africa',
    callingCode: '+225',
    government: {
      capital: 'Yamoussoukro',
      presidentTitle: 'Président de la République',
      system: 'Presidential Republic',
    },
    development: {
      gdpPerCapita: 2540,
      population: 27740000,
      humanDevelopmentIndex: 0.550,
    },
    sectors: {
      priority: ['agriculture', 'mining', 'energy', 'infrastructure', 'services'],
      keyIndustries: ['cocoa', 'coffee', 'oil', 'gold', 'palm oil'],
    },
    kpiCategories: [
      'Agricultural Production',
      'Mining Output',
      'Energy Access',
      'Infrastructure Quality',
      'Economic Growth',
      'Export Performance',
      'Education Access',
      'Healthcare Coverage',
    ],
  },
  SN: {
    code: 'SN',
    name: 'Sénégal',
    nameEn: 'Senegal',
    nameFr: 'Sénégal',
    nameLocal: 'Senegal',
    currency: {
      code: 'XOF',
      symbol: 'FCFA',
      name: 'West African CFA Franc',
      subunit: 'centime',
    },
    languages: {
      official: ['fr'],
      working: ['fr', 'wo'],
    },
    timezone: 'Africa/Dakar',
    region: 'West Africa',
    callingCode: '+221',
    government: {
      capital: 'Dakar',
      presidentTitle: 'Président de la République',
      system: 'Presidential Republic',
    },
    development: {
      gdpPerCapita: 1580,
      population: 17690000,
      humanDevelopmentIndex: 0.511,
    },
    sectors: {
      priority: ['infrastructure', 'agriculture', 'tourism', 'fishing', 'services'],
      keyIndustries: ['phosphates', 'tourism', 'agriculture', 'fishing', 'mining'],
    },
    kpiCategories: [
      'Infrastructure Development',
      'Agricultural Growth',
      'Tourism Performance',
      'Fishing Industry',
      'Mining Production',
      'Energy Access',
      'Digital Transformation',
      'Education Quality',
    ],
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    nameEn: 'Nigeria',
    nameFr: 'Nigeria',
    nameLocal: 'Nigeria',
    currency: {
      code: 'NGN',
      symbol: '₦',
      name: 'Nigerian Naira',
      subunit: 'kobo',
    },
    languages: {
      official: ['en'],
      working: ['en', 'yo', 'ig', 'ha'],
    },
    timezone: 'Africa/Lagos',
    region: 'West Africa',
    callingCode: '+234',
    government: {
      capital: 'Abuja',
      presidentTitle: 'President',
      system: 'Presidential Republic',
    },
    development: {
      gdpPerCapita: 2180,
      population: 213400000,
      humanDevelopmentIndex: 0.535,
    },
    sectors: {
      priority: ['oil', 'gas', 'agriculture', 'manufacturing', 'services'],
      keyIndustries: ['oil', 'gas', 'agriculture', 'entertainment', 'telecom'],
    },
    kpiCategories: [
      'Oil & Gas Production',
      'Agricultural Output',
      'Manufacturing Growth',
      'Service Sector',
      'Infrastructure Development',
      'Power Generation',
      'Digital Economy',
      'Financial Services',
    ],
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    nameEn: 'Kenya',
    nameFr: 'Kenya',
    nameLocal: 'Kenya',
    currency: {
      code: 'KES',
      symbol: 'KSh',
      name: 'Kenyan Shilling',
      subunit: 'cent',
    },
    languages: {
      official: ['en', 'sw'],
      working: ['en', 'sw'],
    },
    timezone: 'Africa/Nairobi',
    region: 'East Africa',
    callingCode: '+254',
    government: {
      capital: 'Nairobi',
      presidentTitle: 'President',
      system: 'Presidential Republic',
    },
    development: {
      gdpPerCapita: 2140,
      population: 54000000,
      humanDevelopmentIndex: 0.575,
    },
    sectors: {
      priority: ['technology', 'agriculture', 'tourism', 'manufacturing', 'services'],
      keyIndustries: ['technology', 'agriculture', 'tourism', 'finance', 'telecom'],
    },
    kpiCategories: [
      'Technology Innovation',
      'Agricultural Production',
      'Tourism Performance',
      'Manufacturing Growth',
      'Financial Services',
      'Infrastructure Quality',
      'Digital Economy',
      'Renewable Energy',
    ],
  },
}

/**
 * Get country configuration by code
 */
export function getCountryConfig(countryCode: string): CountryConfig | null {
  return AFRICAN_COUNTRIES[countryCode.toUpperCase()] || null
}

/**
 * Get all countries
 */
export function getAllCountries(): CountryConfig[] {
  return Object.values(AFRICAN_COUNTRIES)
}

/**
 * Get countries by region
 */
export function getCountriesByRegion(region: string): CountryConfig[] {
  return Object.values(AFRICAN_COUNTRIES).filter(
    country => country.region.toLowerCase().includes(region.toLowerCase())
  )
}

/**
 * Format currency for country
 */
export function formatCurrencyForCountry(amount: number, countryCode: string): string {
  const country = getCountryConfig(countryCode)
  if (!country) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: country.currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch (error) {
    return `${country.currency.symbol} ${amount.toLocaleString('fr-FR')}`
  }
}

/**
 * Get country-specific KPI categories
 */
export function getCountryKpiCategories(countryCode: string): string[] {
  const country = getCountryConfig(countryCode)
  return country?.kpiCategories || []
}

/**
 * Get priority sectors for country
 */
export function getCountryPrioritySectors(countryCode: string): string[] {
  const country = getCountryConfig(countryCode)
  return country?.sectors.priority || []
}
