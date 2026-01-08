import { describe, it, expect } from 'vitest'
import {
  calcBracketTax,
  calcFederalTax,
  calcProvincialStateTax,
  calcSelfEmploymentTax,
  calcTotalTax,
  calcEffectiveRate,
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
    // $55,867 * 15% + $44,133 * 20.5% = $8,380 + $9,047 = ~$17,427
    const tax = calcFederalTax('CA', 100000)
    expect(tax).toBeGreaterThan(17000)
    expect(tax).toBeLessThan(18000)
  })

  it('calculates US federal tax for $100k income (single)', () => {
    // $11,925 * 10% + $36,550 * 12% + $51,525 * 22% = ~$16,914
    const tax = calcFederalTax('US', 100000)
    expect(tax).toBeGreaterThan(16000)
    expect(tax).toBeLessThan(18000)
  })

  it('calculates Canada federal tax for $200k income', () => {
    const tax = calcFederalTax('CA', 200000)
    expect(tax).toBeGreaterThan(40000)
    expect(tax).toBeLessThan(50000)
  })

  it('calculates US federal tax for $200k income', () => {
    const tax = calcFederalTax('US', 200000)
    expect(tax).toBeGreaterThan(40000)
    expect(tax).toBeLessThan(50000)
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
    // CPP: 11.9% on earnings up to $68,500 max
    // $68,500 * 11.9% = $8,151.50
    const tax = calcSelfEmploymentTax('CA', 100000)
    expect(tax).toBeCloseTo(8151.5, 1)
  })

  it('calculates Canada CPP for $50k income (below max)', () => {
    // $50,000 * 11.9% = $5,950
    const tax = calcSelfEmploymentTax('CA', 50000)
    expect(tax).toBeCloseTo(5950, 0)
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
    // SS: $168,600 * 12.4% = $20,906
    // Medicare: $230,875 * 2.9% = $6,695
    // Additional Medicare: $50k * 0.9% = $450
    // Total: ~$28,052
    const tax = calcSelfEmploymentTax('US', 250000)
    expect(tax).toBeGreaterThan(27000)
    expect(tax).toBeLessThan(32000)
  })
})

describe('calcTotalTax', () => {
  it('calculates total tax for Ontario contractor at $100k', () => {
    const total = calcTotalTax('CA', 'ON', 100000, true)
    // Federal ~$17,427 + Ontario ~$7,040 + CPP ~$8,152 = ~$32,619
    expect(total).toBeGreaterThan(30000)
    expect(total).toBeLessThan(36000)
  })

  it('calculates total tax without self-employment', () => {
    const total = calcTotalTax('CA', 'ON', 100000, false)
    // Federal ~$17,427 + Ontario ~$7,040 = ~$24,467
    expect(total).toBeGreaterThan(22000)
    expect(total).toBeLessThan(28000)
  })

  it('calculates total tax for Texas contractor at $100k', () => {
    const total = calcTotalTax('US', 'TX', 100000, true)
    // Federal ~$17,400 + TX $0 + SE ~$14,130 = ~$31,530
    expect(total).toBeGreaterThan(28000)
    expect(total).toBeLessThan(35000)
  })
})

describe('calcEffectiveRate', () => {
  it('calculates effective rate for Ontario at $100k', () => {
    const rate = calcEffectiveRate('CA', 'ON', 100000, true)
    // ~32% effective
    expect(rate).toBeGreaterThan(0.30)
    expect(rate).toBeLessThan(0.36)
  })

  it('calculates effective rate for Texas at $100k', () => {
    const rate = calcEffectiveRate('US', 'TX', 100000, true)
    // ~31% effective (no state tax but SE tax)
    expect(rate).toBeGreaterThan(0.28)
    expect(rate).toBeLessThan(0.35)
  })

  it('calculates effective rate for California at $150k', () => {
    const rate = calcEffectiveRate('US', 'CA', 150000, true)
    // Higher due to CA state tax
    expect(rate).toBeGreaterThan(0.32)
    expect(rate).toBeLessThan(0.42)
  })
})
