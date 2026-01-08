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

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: 'CAD' | 'USD',
  compact = false
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  })
  return formatter.format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}
