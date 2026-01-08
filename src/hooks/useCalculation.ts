import { useMemo } from 'react'
import type { CalculatorState } from '@/types'
import { calcBillableHours, calcGrossAnnual, calcNetAnnual } from '@/lib/calculate'
import { getTaxBreakdown, type TaxBreakdown } from '@/lib/tax'

export interface CalculationResult {
  billableHours: number
  grossAnnual: number
  netAnnual: number
  taxBreakdown: TaxBreakdown
}

export function useCalculation(state: CalculatorState): CalculationResult {
  return useMemo(() => {
    const billableHours = calcBillableHours(
      52, // weeks per year
      state.daysPerWeek,
      state.hoursPerDay,
      state.holidaysPerYear,
      state.ptoDays,
      state.sickDays
    )

    const grossAnnual = calcGrossAnnual(state.hourlyRate, billableHours)

    const taxBreakdown = getTaxBreakdown(
      state.country,
      state.region,
      grossAnnual,
      state.isSelfEmployed
    )

    const netAnnual = calcNetAnnual(grossAnnual, taxBreakdown.total)

    return {
      billableHours,
      grossAnnual,
      netAnnual,
      taxBreakdown,
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
  ])
}
