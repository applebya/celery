import { canadaTax, usTax, type TaxBracket, type TaxConfig } from '@/data/tax-brackets-2026'

/**
 * Calculate tax using progressive brackets
 */
export function calcBracketTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0
  let remainingIncome = income

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break

    const bracketSize = bracket.max ? bracket.max - bracket.min : Infinity
    const taxableInBracket = Math.min(remainingIncome, bracketSize)
    tax += taxableInBracket * bracket.rate
    remainingIncome -= taxableInBracket
  }

  return tax
}

/**
 * Calculate federal tax for a country
 */
export function calcFederalTax(country: 'CA' | 'US', income: number): number {
  const config = country === 'CA' ? canadaTax : usTax
  return calcBracketTax(income, config.federal)
}

/**
 * Calculate provincial (CA) or state (US) tax
 */
export function calcProvincialStateTax(
  country: 'CA' | 'US',
  region: string,
  income: number
): number {
  const config = country === 'CA' ? canadaTax : usTax
  const regions = country === 'CA' ? config.provinces : config.states

  if (!regions || !regions[region]) {
    return 0
  }

  const brackets = regions[region]
  if (brackets.length === 0) {
    return 0 // No income tax (e.g., Texas, Florida)
  }

  return calcBracketTax(income, brackets)
}

/**
 * Calculate self-employment taxes (CPP for Canada, SE tax for US)
 */
export function calcSelfEmploymentTax(country: 'CA' | 'US', income: number): number {
  if (country === 'CA') {
    return calcCanadaCPP(income)
  } else {
    return calcUSSelfEmploymentTax(income)
  }
}

/**
 * Calculate Canada CPP contribution (both employer + employee portions)
 */
function calcCanadaCPP(income: number): number {
  const cpp = canadaTax.selfEmployment[0] // CPP config
  const taxableIncome = Math.min(income, cpp.maxEarnings ?? income)
  return taxableIncome * cpp.rate
}

/**
 * Calculate US self-employment tax
 * - Applied to 92.35% of net self-employment earnings
 * - Social Security: 12.4% up to wage base
 * - Medicare: 2.9% on all earnings
 * - Additional Medicare: 0.9% on earnings over $200k
 */
function calcUSSelfEmploymentTax(income: number): number {
  const SE_RATE = 0.9235 // 92.35% of net earnings subject to SE tax
  const seEarnings = income * SE_RATE

  const ssTax = usTax.selfEmployment[0] // Social Security
  const medicareTax = usTax.selfEmployment[1] // Medicare
  const additionalMedicare = usTax.selfEmployment[2] // Additional Medicare

  // Social Security (capped)
  const ssEarnings = Math.min(seEarnings, ssTax.maxEarnings ?? seEarnings)
  const ssTaxAmount = ssEarnings * ssTax.rate

  // Medicare (no cap)
  const medicareTaxAmount = seEarnings * medicareTax.rate

  // Additional Medicare (on earnings over $200k)
  const additionalMedicareThreshold = 200000
  const additionalMedicareEarnings = Math.max(0, income - additionalMedicareThreshold)
  const additionalMedicareTaxAmount = additionalMedicareEarnings * additionalMedicare.rate

  return ssTaxAmount + medicareTaxAmount + additionalMedicareTaxAmount
}

/**
 * Calculate total tax (federal + provincial/state + self-employment)
 */
export function calcTotalTax(
  country: 'CA' | 'US',
  region: string,
  income: number,
  isSelfEmployed: boolean
): number {
  const federalTax = calcFederalTax(country, income)
  const provincialStateTax = calcProvincialStateTax(country, region, income)
  const selfEmploymentTax = isSelfEmployed ? calcSelfEmploymentTax(country, income) : 0

  return federalTax + provincialStateTax + selfEmploymentTax
}

/**
 * Calculate effective tax rate
 */
export function calcEffectiveRate(
  country: 'CA' | 'US',
  region: string,
  income: number,
  isSelfEmployed: boolean
): number {
  if (income === 0) return 0
  const totalTax = calcTotalTax(country, region, income, isSelfEmployed)
  return totalTax / income
}

/**
 * Get tax breakdown for display
 */
export interface TaxBreakdown {
  federal: number
  provincialState: number
  selfEmployment: number
  total: number
  effectiveRate: number
}

export function getTaxBreakdown(
  country: 'CA' | 'US',
  region: string,
  income: number,
  isSelfEmployed: boolean
): TaxBreakdown {
  const federal = calcFederalTax(country, income)
  const provincialState = calcProvincialStateTax(country, region, income)
  const selfEmployment = isSelfEmployed ? calcSelfEmploymentTax(country, income) : 0
  const total = federal + provincialState + selfEmployment
  const effectiveRate = income > 0 ? total / income : 0

  return {
    federal,
    provincialState,
    selfEmployment,
    total,
    effectiveRate,
  }
}
