export interface Region {
  code: string
  name: string
  holidays: number
}

export interface Country {
  code: string
  name: string
  flag: string
  currency: 'CAD' | 'USD'
  regions: Region[]
}

export const countries: Country[] = [
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    regions: [
      { code: 'AB', name: 'Alberta', holidays: 9 },
      { code: 'BC', name: 'British Columbia', holidays: 11 },
      { code: 'MB', name: 'Manitoba', holidays: 9 },
      { code: 'NB', name: 'New Brunswick', holidays: 8 },
      { code: 'NL', name: 'Newfoundland & Labrador', holidays: 6 },
      { code: 'NS', name: 'Nova Scotia', holidays: 6 },
      { code: 'NT', name: 'Northwest Territories', holidays: 11 },
      { code: 'NU', name: 'Nunavut', holidays: 11 },
      { code: 'ON', name: 'Ontario', holidays: 9 },
      { code: 'PE', name: 'Prince Edward Island', holidays: 8 },
      { code: 'QC', name: 'Quebec', holidays: 8 },
      { code: 'SK', name: 'Saskatchewan', holidays: 10 },
      { code: 'YT', name: 'Yukon', holidays: 11 },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    regions: [
      { code: 'AL', name: 'Alabama', holidays: 11 },
      { code: 'AK', name: 'Alaska', holidays: 11 },
      { code: 'AZ', name: 'Arizona', holidays: 11 },
      { code: 'AR', name: 'Arkansas', holidays: 11 },
      { code: 'CA', name: 'California', holidays: 12 }, // César Chávez Day
      { code: 'CO', name: 'Colorado', holidays: 11 },
      { code: 'CT', name: 'Connecticut', holidays: 12 }, // Good Friday
      { code: 'DE', name: 'Delaware', holidays: 12 }, // Good Friday
      { code: 'FL', name: 'Florida', holidays: 12 }, // Day after Thanksgiving
      { code: 'GA', name: 'Georgia', holidays: 11 },
      { code: 'HI', name: 'Hawaii', holidays: 12 }, // Good Friday
      { code: 'ID', name: 'Idaho', holidays: 11 },
      { code: 'IL', name: 'Illinois', holidays: 12 }, // Day after Thanksgiving
      { code: 'IN', name: 'Indiana', holidays: 12 }, // Good Friday
      { code: 'IA', name: 'Iowa', holidays: 11 },
      { code: 'KS', name: 'Kansas', holidays: 11 },
      { code: 'KY', name: 'Kentucky', holidays: 12 }, // Good Friday
      { code: 'LA', name: 'Louisiana', holidays: 12 }, // Good Friday
      { code: 'ME', name: 'Maine', holidays: 12 }, // Patriots' Day
      { code: 'MD', name: 'Maryland', holidays: 11 },
      { code: 'MA', name: 'Massachusetts', holidays: 12 }, // Patriots' Day
      { code: 'MI', name: 'Michigan', holidays: 11 },
      { code: 'MN', name: 'Minnesota', holidays: 11 },
      { code: 'MS', name: 'Mississippi', holidays: 11 },
      { code: 'MO', name: 'Missouri', holidays: 12 }, // Truman Day
      { code: 'MT', name: 'Montana', holidays: 11 },
      { code: 'NE', name: 'Nebraska', holidays: 12 }, // Arbor Day
      { code: 'NV', name: 'Nevada', holidays: 12 }, // Nevada Day
      { code: 'NH', name: 'New Hampshire', holidays: 11 },
      { code: 'NJ', name: 'New Jersey', holidays: 12 }, // Good Friday
      { code: 'NM', name: 'New Mexico', holidays: 11 },
      { code: 'NY', name: 'New York', holidays: 13 }, // Election Day, Lincoln's Birthday
      { code: 'NC', name: 'North Carolina', holidays: 12 }, // Good Friday
      { code: 'ND', name: 'North Dakota', holidays: 12 }, // Good Friday
      { code: 'OH', name: 'Ohio', holidays: 11 },
      { code: 'OK', name: 'Oklahoma', holidays: 11 },
      { code: 'OR', name: 'Oregon', holidays: 11 },
      { code: 'PA', name: 'Pennsylvania', holidays: 12 }, // Flag Day
      { code: 'RI', name: 'Rhode Island', holidays: 12 }, // Victory Day
      { code: 'SC', name: 'South Carolina', holidays: 11 },
      { code: 'SD', name: 'South Dakota', holidays: 11 },
      { code: 'TN', name: 'Tennessee', holidays: 12 }, // Good Friday
      { code: 'TX', name: 'Texas', holidays: 14 }, // Christmas Eve, Day after Christmas, Day after Thanksgiving
      { code: 'UT', name: 'Utah', holidays: 12 }, // Pioneer Day
      { code: 'VT', name: 'Vermont', holidays: 13 }, // Town Meeting Day, Bennington Battle Day
      { code: 'VA', name: 'Virginia', holidays: 11 },
      { code: 'WA', name: 'Washington', holidays: 11 },
      { code: 'WV', name: 'West Virginia', holidays: 12 }, // West Virginia Day
      { code: 'WI', name: 'Wisconsin', holidays: 11 },
      { code: 'WY', name: 'Wyoming', holidays: 11 },
      { code: 'DC', name: 'District of Columbia', holidays: 12 }, // Inauguration Day
    ],
  },
]

export function getCountry(code: string): Country | undefined {
  return countries.find((c) => c.code === code)
}

export function getRegion(countryCode: string, regionCode: string): Region | undefined {
  const country = getCountry(countryCode)
  return country?.regions.find((r) => r.code === regionCode)
}

export function getHolidayCount(countryCode: string, regionCode: string): number {
  const region = getRegion(countryCode, regionCode)
  return region?.holidays ?? 0
}
