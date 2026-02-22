import { describe, it, expect } from 'vitest'
import {
  calcBracketTax,
  calcFederalTax,
  calcProvincialStateTax,
  calcEmployeePayrollTax,
  calcSelfEmploymentTax,
  calcTotalTax,
  calcEffectiveRate,
  calcTaxableIncome,
  getTaxBreakdown,
} from './tax'

describe('calcBracketTax', () => {
  it('calculates tax for single bracket income', () => {
    // $50,000 in Canada federal: all at 15%
    const brackets = [
      { min: 0, max: 55867, rate: 0.15 },
      { min: 55867, max: 111733, rate: 0.205 },
    ]
    expect(calcBracketTax(50000, brackets)).toBeCloseTo(7500, 0)
  })

  it('calculates tax spanning multiple brackets', () => {
    // $100,000 in Canada federal:
    // First $55,867 at 15% = $8,380.05
    // Remaining $44,133 at 20.5% = $9,047.27
    // Total = $17,427.32
    const brackets = [
      { min: 0, max: 55867, rate: 0.15 },
      { min: 55867, max: 111733, rate: 0.205 },
    ]
    expect(calcBracketTax(100000, brackets)).toBeCloseTo(17427, 0)
  })
})

describe('calcFederalTax', () => {
  it('calculates Canada federal tax for $100k income', () => {
    // $58,523 * 14% + $41,477 * 20.5% = ~$16,697
    const tax = calcFederalTax('CA', 100000)
    expect(tax).toBeGreaterThan(16000)
    expect(tax).toBeLessThan(18000)
  })

  it('calculates US federal tax for $100k taxable income (single)', () => {
    // $12,400 * 10% + $38,000 * 12% + $49,600 * 22% = ~$16,712
    const tax = calcFederalTax('US', 100000)
    expect(tax).toBeGreaterThan(16000)
    expect(tax).toBeLessThan(18000)
  })

  it('calculates Canada federal tax for $200k income', () => {
    const tax = calcFederalTax('CA', 200000)
    expect(tax).toBeGreaterThan(40000)
    expect(tax).toBeLessThan(45000)
  })

  it('calculates US federal tax for $200k taxable income', () => {
    const tax = calcFederalTax('US', 200000)
    expect(tax).toBeGreaterThan(38000)
    expect(tax).toBeLessThan(45000)
  })
})

describe('calcProvincialStateTax', () => {
  it('calculates Ontario tax for $100k income', () => {
    // $51,446 * 5.05% + $48,554 * 9.15% = ~$7,040
    const tax = calcProvincialStateTax('CA', 'ON', 100000)
    expect(tax).toBeGreaterThan(6000)
    expect(tax).toBeLessThan(8000)
  })

  it('calculates BC tax for $100k income', () => {
    const tax = calcProvincialStateTax('CA', 'BC', 100000)
    expect(tax).toBeGreaterThan(5000)
    expect(tax).toBeLessThan(8000)
  })

  it('calculates California tax for $100k income', () => {
    const tax = calcProvincialStateTax('US', 'CA', 100000)
    expect(tax).toBeGreaterThan(4000)
    expect(tax).toBeLessThan(8000)
  })

  it('returns 0 for Texas (no state income tax)', () => {
    const tax = calcProvincialStateTax('US', 'TX', 100000)
    expect(tax).toBe(0)
  })

  it('returns 0 for Florida (no state income tax)', () => {
    const tax = calcProvincialStateTax('US', 'FL', 100000)
    expect(tax).toBe(0)
  })
})

describe('calcSelfEmploymentTax', () => {
  it('calculates Canada CPP for $100k income', () => {
    // CPP base + additional to YMPE + CPP2 to YAMPE
    const tax = calcSelfEmploymentTax('CA', 100000)
    expect(tax).toBeGreaterThan(9000)
    expect(tax).toBeLessThan(9700)
  })

  it('calculates Canada CPP for $50k income (below max)', () => {
    // (50,000 - 3,500) * 11.9% = ~$5,534
    const tax = calcSelfEmploymentTax('CA', 50000)
    expect(tax).toBeGreaterThan(5400)
    expect(tax).toBeLessThan(5800)
  })

  it('calculates US self-employment tax for $100k income', () => {
    // SE tax applied to 92.35% of net
    // Social Security: 12.4% on first $168,600 (capped)
    // Medicare: 2.9% on all
    // $92,350 * 12.4% + $92,350 * 2.9% = ~$14,130
    const tax = calcSelfEmploymentTax('US', 100000)
    expect(tax).toBeGreaterThan(13000)
    expect(tax).toBeLessThan(15500)
  })

  it('calculates US self-employment tax for $250k income (with additional Medicare)', () => {
    // Over $200k triggers additional 0.9% Medicare
    // SE earnings: $250k * 92.35% = $230,875
    // SS: $184,500 * 12.4% = $22,878
    // Medicare: $230,875 * 2.9% = $6,695
    // Additional Medicare: $50k * 0.9% = $450
    // Total: ~$30,023
    const tax = calcSelfEmploymentTax('US', 250000)
    expect(tax).toBeGreaterThan(29000)
    expect(tax).toBeLessThan(32000)
  })
})

describe('calcTotalTax', () => {
  it('calculates total tax for Ontario contractor at $100k', () => {
    const total = calcTotalTax('CA', 'ON', 100000, true)
    // Includes federal + provincial (after BPA credits) + CPP/CPP2
    expect(total).toBeGreaterThan(28000)
    expect(total).toBeLessThan(33000)
  })

  it('calculates total tax without self-employment', () => {
    const total = calcTotalTax('CA', 'ON', 100000, false)
    // Federal + Ontario after BPA credits
    expect(total).toBeGreaterThan(24000)
    expect(total).toBeLessThan(28000)
  })

  it('calculates total tax for Texas contractor at $100k', () => {
    const total = calcTotalTax('US', 'TX', 100000, true)
    // Federal (after standard deduction) + SE tax
    expect(total).toBeGreaterThan(25000)
    expect(total).toBeLessThan(31000)
  })
})

describe('calcEffectiveRate', () => {
  it('calculates effective rate for Ontario at $100k', () => {
    const rate = calcEffectiveRate('CA', 'ON', 100000, true)
    // ~30% effective
    expect(rate).toBeGreaterThan(0.27)
    expect(rate).toBeLessThan(0.33)
  })

  it('calculates effective rate for Texas at $100k', () => {
    const rate = calcEffectiveRate('US', 'TX', 100000, true)
    // ~27% effective (no state tax but SE tax)
    expect(rate).toBeGreaterThan(0.24)
    expect(rate).toBeLessThan(0.31)
  })

  it('calculates effective rate for California at $150k', () => {
    const rate = calcEffectiveRate('US', 'CA', 150000, true)
    // Higher due to CA state tax
    expect(rate).toBeGreaterThan(0.28)
    expect(rate).toBeLessThan(0.4)
  })
})

describe('calcTaxableIncome', () => {
  it('applies US standard deduction (single)', () => {
    const taxable = calcTaxableIncome('US', 100000)
    expect(taxable).toBe(83900)
  })

  it('does not reduce Canada taxable income', () => {
    const taxable = calcTaxableIncome('CA', 100000)
    expect(taxable).toBe(100000)
  })
})

describe('basic personal amount credits', () => {
  it('reduces Canada federal and provincial taxes', () => {
    const baseFederal = calcFederalTax('CA', 100000)
    const baseProv = calcProvincialStateTax('CA', 'ON', 100000)
    const breakdown = getTaxBreakdown('CA', 'ON', 100000, false)
    expect(breakdown.federal).toBeLessThan(baseFederal)
    expect(breakdown.provincialState).toBeLessThan(baseProv)
  })
})

describe('calcEmployeePayrollTax', () => {
  it('calculates US employee payroll tax for $100k', () => {
    const tax = calcEmployeePayrollTax('US', 100000)
    expect(tax).toBeGreaterThan(7000)
    expect(tax).toBeLessThan(8000)
  })

  it('calculates US employee payroll tax for $250k (with additional Medicare)', () => {
    const tax = calcEmployeePayrollTax('US', 250000)
    expect(tax).toBeGreaterThan(15000)
    expect(tax).toBeLessThan(16500)
  })

  it('calculates Canada employee payroll tax for $100k', () => {
    const tax = calcEmployeePayrollTax('CA', 100000)
    expect(tax).toBeGreaterThan(5200)
    expect(tax).toBeLessThan(6200)
  })
})
