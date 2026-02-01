import { useMemo } from "react";
import type { CalculatorState } from "@/types";
import {
  calcBillableHours,
  calcGrossAnnual,
  calcNetAnnual,
} from "@/lib/calculate";
import { getTaxBreakdown, type TaxBreakdown } from "@/lib/tax";

export interface CalculationResult {
  billableHours: number;
  grossAnnual: number;
  netAnnual: number;
  taxBreakdown: TaxBreakdown;
  // For reverse calculation mode
  calculatedHourlyRate: number;
  // Effective hourly rate range (for retainer mode)
  effectiveHourlyMin: number;
  effectiveHourlyMax: number;
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
      state.unlimitedPTO ? 0 : state.sickDays,
    );

    let grossAnnual: number;
    let calculatedHourlyRate: number;
    let effectiveHourlyMin = 0;
    let effectiveHourlyMax = 0;

    // Handle different employment types
    if (state.employmentType === "contractor-retainer") {
      // Retainer mode: monthly retainer × 12
      grossAnnual = state.monthlyRetainer * 12;
      // Calculate effective hourly rate range
      const monthlyHoursMin = state.expectedHoursMin || 1;
      const monthlyHoursMax = state.expectedHoursMax || monthlyHoursMin;
      effectiveHourlyMin = state.monthlyRetainer / monthlyHoursMax;
      effectiveHourlyMax = state.monthlyRetainer / monthlyHoursMin;
      calculatedHourlyRate = (effectiveHourlyMin + effectiveHourlyMax) / 2;
    } else if (
      state.employmentType === "employee-salary" ||
      state.calculationMode === "salaryToHourly"
    ) {
      // Salary mode: target salary → hourly rate
      grossAnnual = state.targetSalary;
      calculatedHourlyRate =
        billableHours > 0 ? grossAnnual / billableHours : 0;
      effectiveHourlyMin = calculatedHourlyRate;
      effectiveHourlyMax = calculatedHourlyRate;
    } else {
      // Hourly mode: hourly rate → salary
      grossAnnual = calcGrossAnnual(state.hourlyRate, billableHours);
      calculatedHourlyRate = state.hourlyRate;
      effectiveHourlyMin = state.hourlyRate;
      effectiveHourlyMax = state.hourlyRate;
    }

    // Calculate standard tax breakdown
    const taxBreakdown = getTaxBreakdown(
      state.country,
      state.region,
      grossAnnual,
      state.isSelfEmployed,
    );

    const netAnnual = calcNetAnnual(grossAnnual, taxBreakdown.total);

    return {
      billableHours,
      grossAnnual,
      netAnnual,
      taxBreakdown,
      calculatedHourlyRate,
      effectiveHourlyMin,
      effectiveHourlyMax,
    };
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
  ]);
}
