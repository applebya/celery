export interface CalculatorState {
  title: string
  hourlyRate: number
  currency: 'CAD' | 'USD'
  country: 'CA' | 'US'
  region: string
  holidaysPerYear: number
  ptoDays: number
  sickDays: number
  hoursPerDay: number
  daysPerWeek: number
  showTaxEstimate: boolean
  isSelfEmployed: boolean
}

export interface ExchangeRate {
  rate: number
  timestamp: number
  from: string
  to: string
}

export const DEFAULT_STATE: CalculatorState = {
  title: '',
  hourlyRate: 100,
  currency: 'CAD',
  country: 'CA',
  region: 'ON',
  holidaysPerYear: 9,
  ptoDays: 0,
  sickDays: 0,
  hoursPerDay: 8,
  daysPerWeek: 5,
  showTaxEstimate: true,
  isSelfEmployed: true,
}
