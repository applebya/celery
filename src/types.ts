export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP'

export interface CalculatorState {
  title: string
  hourlyRate: number
  currency: Currency
  country: 'CA' | 'US'
  region: string
  holidaysPerYear: number
  ptoDays: number
  sickDays: number
  hoursPerDay: number
  daysPerWeek: number
  showTaxEstimate: boolean
  isSelfEmployed: boolean
  // New: calculation mode (hourly → salary or salary → hourly)
  calculationMode: 'hourlyToSalary' | 'salaryToHourly'
  targetSalary: number
  // Unlimited PTO: time off doesn't reduce billable hours (employer provides paid time off)
  unlimitedPTO: boolean
}

export interface ExchangeRates {
  rates: Record<Currency, number> // All rates relative to USD
  timestamp: number
}

export interface HistoricalRate {
  date: string
  rate: number
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
  calculationMode: 'hourlyToSalary',
  targetSalary: 150000,
  unlimitedPTO: false,
}
