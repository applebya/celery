import type { Currency } from '@/types'

/**
 * Calculate base working hours per year
 */
export function calcBaseHours(
  weeksPerYear: number,
  daysPerWeek: number,
  hoursPerDay: number
): number {
  return weeksPerYear * daysPerWeek * hoursPerDay
}

/**
 * Calculate billable hours after subtracting time off
 */
export function calcBillableHours(
  weeksPerYear: number,
  daysPerWeek: number,
  hoursPerDay: number,
  holidays: number,
  ptoDays: number,
  sickDays: number
): number {
  const baseHours = calcBaseHours(weeksPerYear, daysPerWeek, hoursPerDay)
  const holidayHours = holidays * hoursPerDay
  const ptoHours = ptoDays * hoursPerDay
  const sickHours = sickDays * hoursPerDay
  return baseHours - holidayHours - ptoHours - sickHours
}

/**
 * Calculate gross annual income
 */
export function calcGrossAnnual(hourlyRate: number, billableHours: number): number {
  return hourlyRate * billableHours
}

/**
 * Calculate net annual income (after tax)
 */
export function calcNetAnnual(grossAnnual: number, totalTax: number): number {
  return grossAnnual - totalTax
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  CAD: '$',
  EUR: '€',
  GBP: '£',
  MXN: '$',
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options: { compact?: boolean; showCode?: boolean } = {}
): string {
  const { compact = false, showCode = true } = options
  const symbol = CURRENCY_SYMBOLS[currency]
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  })
  const formatted = `${symbol}${formatter.format(amount)}`
  return showCode ? `${formatted} ${currency}` : formatted
}

/**
 * Format percentage for display
 */
export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}
