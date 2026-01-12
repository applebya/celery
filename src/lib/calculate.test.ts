import { describe, it, expect } from 'vitest'
import {
  calcBaseHours,
  calcBillableHours,
  calcGrossAnnual,
  calcNetAnnual,
  formatCurrency,
  formatPercent,
} from './calculate'

describe('calcBaseHours', () => {
  it('calculates standard 40hr work week', () => {
    expect(calcBaseHours(52, 5, 8)).toBe(2080)
  })

  it('calculates part-time schedule', () => {
    expect(calcBaseHours(52, 4, 6)).toBe(1248)
  })

  it('calculates full-time with longer days', () => {
    expect(calcBaseHours(52, 5, 10)).toBe(2600)
  })
})

describe('calcBillableHours', () => {
  it('subtracts holidays from base hours', () => {
    // 2080 - (9 holidays * 8 hours) = 2080 - 72 = 2008
    expect(calcBillableHours(52, 5, 8, 9, 0, 0)).toBe(2008)
  })

  it('subtracts PTO days', () => {
    // 2080 - (0 holidays) - (7 PTO * 8) = 2080 - 56 = 2024
    expect(calcBillableHours(52, 5, 8, 0, 7, 0)).toBe(2024)
  })

  it('subtracts sick days', () => {
    // 2080 - (0 holidays) - (0 PTO) - (5 sick * 8) = 2080 - 40 = 2040
    expect(calcBillableHours(52, 5, 8, 0, 0, 5)).toBe(2040)
  })

  it('subtracts all time off types', () => {
    // 2080 - (9 * 8) - (7 * 8) - (5 * 8) = 2080 - 72 - 56 - 40 = 1912
    expect(calcBillableHours(52, 5, 8, 9, 7, 5)).toBe(1912)
  })

  it('handles Ontario contractor with 7 PTO', () => {
    // 2080 - (9 holidays * 8) - (7 PTO * 8) - (0 sick * 8) = 2080 - 72 - 56 = 1952
    expect(calcBillableHours(52, 5, 8, 9, 7, 0)).toBe(1952)
  })

  it('handles BC contractor with 0 PTO', () => {
    // 2080 - (11 holidays * 8) - (0 PTO) - (5 sick * 8) = 2080 - 88 - 40 = 1952
    expect(calcBillableHours(52, 5, 8, 11, 0, 5)).toBe(1952)
  })
})

describe('calcGrossAnnual', () => {
  it('calculates annual income from hourly rate', () => {
    expect(calcGrossAnnual(125, 1944)).toBe(243000)
  })

  it('calculates for lower rate', () => {
    expect(calcGrossAnnual(50, 2000)).toBe(100000)
  })

  it('handles decimal rates', () => {
    expect(calcGrossAnnual(75.5, 2000)).toBe(151000)
  })

  it('returns 0 for 0 hours', () => {
    expect(calcGrossAnnual(125, 0)).toBe(0)
  })

  it('returns 0 for 0 rate', () => {
    expect(calcGrossAnnual(0, 2000)).toBe(0)
  })
})

describe('calcNetAnnual', () => {
  it('subtracts tax from gross income', () => {
    expect(calcNetAnnual(100000, 25000)).toBe(75000)
  })

  it('handles zero tax', () => {
    expect(calcNetAnnual(100000, 0)).toBe(100000)
  })

  it('handles high tax rates', () => {
    expect(calcNetAnnual(200000, 80000)).toBe(120000)
  })
})

describe('formatCurrency', () => {
  it('formats USD with symbol and code', () => {
    expect(formatCurrency(100000, 'USD')).toBe('$100,000 USD')
  })

  it('formats CAD correctly', () => {
    expect(formatCurrency(75000, 'CAD')).toBe('$75,000 CAD')
  })

  it('formats EUR with euro symbol', () => {
    expect(formatCurrency(80000, 'EUR')).toBe('€80,000 EUR')
  })

  it('formats GBP with pound symbol', () => {
    expect(formatCurrency(65000, 'GBP')).toBe('£65,000 GBP')
  })

  it('hides currency code when showCode is false', () => {
    expect(formatCurrency(100000, 'USD', { showCode: false })).toBe('$100,000')
  })

  it('uses compact notation when compact is true', () => {
    expect(formatCurrency(100000, 'USD', { compact: true })).toBe('$100K USD')
  })

  it('handles small amounts', () => {
    expect(formatCurrency(500, 'USD')).toBe('$500 USD')
  })
})

describe('formatPercent', () => {
  it('formats decimal as percentage with one decimal place', () => {
    expect(formatPercent(0.25)).toBe('25.0%')
  })

  it('rounds to one decimal place', () => {
    expect(formatPercent(0.0765)).toBe('7.6%')
  })

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })

  it('handles 100%', () => {
    expect(formatPercent(1)).toBe('100.0%')
  })

  it('handles small percentages', () => {
    expect(formatPercent(0.001)).toBe('0.1%')
  })
})
