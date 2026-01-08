import { useMemo } from 'react'
import type { CalculatorState } from '@/types'
import { calcBillableHours, calcGrossAnnual, calcNetAnnual } from '@/lib/calculate'
import { getTaxBreakdown, type TaxBreakdown } from '@/lib/tax'

export interface CalculationResult {
  billableHours: number
  grossAnnual: number
  netAnnual: number
  taxBreakdown: TaxBreakdown
  // For reverse calculation mode
  calculatedHourlyRate: number
}

export function useCalculation(state: CalculatorState): CalculationResult {
  return useMemo(() => {
    // Calculate billable hours based on mode
    let billableHours: number
    if (state.fixedMonthlyHours) {
      // Fixed monthly hours: time off already included in the rate
      billableHours = state.monthlyHours * 12
    } else {
      // Standard calculation: 52 weeks minus time off
      billableHours = calcBillableHours(
        52,
        state.daysPerWeek,
        state.hoursPerDay,
        state.holidaysPerYear,
        state.ptoDays,
        state.sickDays
      )
    }

    let grossAnnual: number
    let calculatedHourlyRate: number

    if (state.calculationMode === 'salaryToHourly') {
      // Reverse calculation: salary → hourly rate
      grossAnnual = state.targetSalary
      calculatedHourlyRate = billableHours > 0 ? grossAnnual / billableHours : 0
    } else {
      // Standard calculation: hourly rate → salary
      grossAnnual = calcGrossAnnual(state.hourlyRate, billableHours)
      calculatedHourlyRate = state.hourlyRate
    }

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
      calculatedHourlyRate,
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
    state.fixedMonthlyHours,
    state.monthlyHours,
  ])
}
