import { useMemo } from 'react'
import type { CalculatorState } from '@/types'
import { isContractorType } from '@/types'
import { calcBillableHours, calcGrossAnnual, calcNetAnnual } from '@/lib/calculate'
import { getTaxBreakdown, type TaxBreakdown } from '@/lib/tax'
import { getCorpTaxRate, getDividendTaxRate, calculateSEtaxSavings } from '@/data/tax-brackets-2026'

export interface CorpBreakdown {
  // Gross revenue before any splits
  grossRevenue: number

  // Corp retained (Canada only - US S-Corps are pass-through)
  corpRetained: number
  corpTax: number
  netInCorp: number

  // Personal draw
  personalDraw: number
  salaryPortion: number
  dividendPortion: number // Called "distribution" in US

  // Taxes on personal income
  salaryTax: number
  dividendTax: number

  // Net amounts
  personalNet: number
  totalNet: number // Personal + Corp retained

  // US S-Corp specific
  seTaxSavings: number // SE tax avoided via distributions

  // Effective rates
  effectiveTaxRate: number
}

export interface CalculationResult {
  billableHours: number
  grossAnnual: number
  netAnnual: number
  taxBreakdown: TaxBreakdown
  // For reverse calculation mode
  calculatedHourlyRate: number
  // Corporation breakdown (when incorporated)
  corpBreakdown: CorpBreakdown | null
  // Effective hourly rate range (for retainer mode)
  effectiveHourlyMin: number
  effectiveHourlyMax: number
}

export function useCalculation(state: CalculatorState): CalculationResult {
  return useMemo(() => {
    // Calculate billable hours
    // If unlimited PTO, time off doesn't reduce billable hours (paid time off)
    const billableHours = calcBillableHours(
      52,
      state.daysPerWeek,
      state.hoursPerDay,
      state.unlimitedPTO ? 0 : state.holidaysPerYear,
      state.unlimitedPTO ? 0 : state.ptoDays,
      state.unlimitedPTO ? 0 : state.sickDays
    )

    let grossAnnual: number
    let calculatedHourlyRate: number
    let effectiveHourlyMin = 0
    let effectiveHourlyMax = 0

    // Handle different employment types
    if (state.employmentType === 'contractor-retainer') {
      // Retainer mode: monthly retainer × 12
      grossAnnual = state.monthlyRetainer * 12
      // Calculate effective hourly rate range
      const monthlyHoursMin = state.expectedHoursMin || 1
      const monthlyHoursMax = state.expectedHoursMax || monthlyHoursMin
      effectiveHourlyMin = state.monthlyRetainer / monthlyHoursMax
      effectiveHourlyMax = state.monthlyRetainer / monthlyHoursMin
      calculatedHourlyRate = (effectiveHourlyMin + effectiveHourlyMax) / 2
    } else if (state.employmentType === 'employee-salary' || state.calculationMode === 'salaryToHourly') {
      // Salary mode: target salary → hourly rate
      grossAnnual = state.targetSalary
      calculatedHourlyRate = billableHours > 0 ? grossAnnual / billableHours : 0
      effectiveHourlyMin = calculatedHourlyRate
      effectiveHourlyMax = calculatedHourlyRate
    } else {
      // Hourly mode: hourly rate → salary
      grossAnnual = calcGrossAnnual(state.hourlyRate, billableHours)
      calculatedHourlyRate = state.hourlyRate
      effectiveHourlyMin = state.hourlyRate
      effectiveHourlyMax = state.hourlyRate
    }

    // Calculate standard tax breakdown (used for non-incorporated or as baseline)
    const taxBreakdown = getTaxBreakdown(
      state.country,
      state.region,
      grossAnnual,
      state.isSelfEmployed
    )

    let netAnnual = calcNetAnnual(grossAnnual, taxBreakdown.total)
    let corpBreakdown: CorpBreakdown | null = null

    // Calculate corporation breakdown if incorporated
    if (state.isIncorporated && isContractorType(state.employmentType)) {
      corpBreakdown = calculateCorpBreakdown(state, grossAnnual)
      // Use corp breakdown's total net as the effective net annual
      netAnnual = corpBreakdown.totalNet
    }

    return {
      billableHours,
      grossAnnual,
      netAnnual,
      taxBreakdown,
      calculatedHourlyRate,
      corpBreakdown,
      effectiveHourlyMin,
      effectiveHourlyMax,
    }
  }, [
    state.daysPerWeek,
    state.hoursPerDay,
    state.holidaysPerYear,
    state.ptoDays,
    state.sickDays,
    state.hourlyRate,
    state.country,
    state.region,
    state.isSelfEmployed,
    state.calculationMode,
    state.targetSalary,
    state.unlimitedPTO,
    state.employmentType,
    state.monthlyRetainer,
    state.expectedHoursMin,
    state.expectedHoursMax,
    state.isIncorporated,
    state.corpRetentionPercent,
    state.dividendVsSalaryPercent,
    state.corpTaxRateOverride,
    state.dividendTaxRateOverride,
  ])
}

/**
 * Calculate corporation breakdown for incorporated contractors
 */
function calculateCorpBreakdown(state: CalculatorState, grossRevenue: number): CorpBreakdown {
  const isUS = state.country === 'US'
  // For corp tax calculations, only CA and US are supported
  const corpCountry: 'CA' | 'US' = state.country === 'US' ? 'US' : 'CA'

  // Get tax rates
  const corpTaxRate = state.corpTaxRateOverride ?? getCorpTaxRate(corpCountry, state.region)
  const dividendTaxRate = state.dividendTaxRateOverride ?? getDividendTaxRate(corpCountry, state.region)

  let corpRetained: number
  let corpTax: number
  let netInCorp: number
  let personalDraw: number
  let salaryPortion: number
  let dividendPortion: number
  let salaryTax: number
  let dividendTax: number
  let seTaxSavings = 0

  if (isUS) {
    // US S-Corp: Pass-through, no corp retention
    corpRetained = 0
    corpTax = 0
    netInCorp = 0
    personalDraw = grossRevenue

    // Split between salary and distributions
    const salaryPercent = (100 - state.dividendVsSalaryPercent) / 100
    salaryPortion = personalDraw * salaryPercent
    dividendPortion = personalDraw * (1 - salaryPercent)

    // Salary tax: income tax + SE tax
    const salaryTaxBreakdown = getTaxBreakdown(state.country, state.region, salaryPortion, true)
    salaryTax = salaryTaxBreakdown.total

    // Distribution tax: income tax only (no SE tax) - taxed as ordinary income
    const distTaxBreakdown = getTaxBreakdown(state.country, state.region, dividendPortion, false)
    // Remove SE tax from the calculation - distributions aren't subject to SE tax
    dividendTax = distTaxBreakdown.federal + distTaxBreakdown.provincialState

    // Calculate SE tax savings
    seTaxSavings = calculateSEtaxSavings(dividendPortion)
  } else {
    // Canadian CCPC
    const retentionPercent = state.corpRetentionPercent / 100
    corpRetained = grossRevenue * retentionPercent
    corpTax = corpRetained * corpTaxRate
    netInCorp = corpRetained - corpTax

    personalDraw = grossRevenue - corpRetained

    // Split personal draw between salary and dividends
    const salaryPercent = (100 - state.dividendVsSalaryPercent) / 100
    salaryPortion = personalDraw * salaryPercent
    dividendPortion = personalDraw * (1 - salaryPercent)

    // Salary tax: regular income tax + CPP (self-employment portion)
    const salaryTaxBreakdown = getTaxBreakdown(state.country, state.region, salaryPortion, true)
    salaryTax = salaryTaxBreakdown.total

    // Dividend tax: use effective dividend tax rate
    // Note: Dividends are taxed after being grossed up, then receive credits
    // We use an effective rate that approximates this
    dividendTax = dividendPortion * dividendTaxRate
  }

  const personalNet = salaryPortion + dividendPortion - salaryTax - dividendTax
  const totalNet = personalNet + netInCorp
  const effectiveTaxRate = grossRevenue > 0 ? (grossRevenue - totalNet) / grossRevenue : 0

  return {
    grossRevenue,
    corpRetained,
    corpTax,
    netInCorp,
    personalDraw,
    salaryPortion,
    dividendPortion,
    salaryTax,
    dividendTax,
    personalNet,
    totalNet,
    seTaxSavings,
    effectiveTaxRate,
  }
}
