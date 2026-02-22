import { useMemo } from "react";
import type { CalculatorState } from "@/types";
import {
  calcBillableHours,
  calcGrossAnnual,
  calcNetAnnual,
} from "@/lib/calculate";
import {
  getTaxBreakdown,
  getFederalBracketDetails,
  getProvincialStateBracketDetails,
  type TaxBreakdown,
  type BracketDetail,
} from "@/lib/tax";

export interface CalculationResult {
  billableHours: number;
  grossAnnual: number;
  netAnnual: number;
  grossBaseAnnual: number;
  netBaseAnnual: number;
  grossTaxableAnnual: number;
  grossCashAnnual: number;
  extrasCashTaxable: number;
  extrasCashNonTaxable: number;
  extrasNonCash: number;
  netCashAnnual: number;
  totalCompAnnual: number;
  equityAnnualized: number;
  extrasTax: number;
  taxBreakdownBase: TaxBreakdown;
  taxBreakdown: TaxBreakdown;
  federalBrackets: BracketDetail[];
  provincialStateBrackets: BracketDetail[];
  // For reverse calculation mode
  calculatedHourlyRate: number;
  // Effective hourly rate range (for retainer mode)
  effectiveHourlyMin: number;
  effectiveHourlyMax: number;
}

export function useCalculation(state: CalculatorState): CalculationResult {
  return useMemo(() => {
    // Calculate billable hours
    // If fixed monthly hours is enabled, use that × 12
    // If unlimited PTO, time off doesn't reduce billable hours (paid time off)
    const billableHours = state.useFixedMonthlyHours
      ? (state.fixedMonthlyHours || 160) * 12
      : calcBillableHours(
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
    const taxBreakdownBase = getTaxBreakdown(
      state.country,
      state.region,
      grossAnnual,
      state.isSelfEmployed,
    );

    // Get detailed bracket breakdowns
    const federalBrackets = getFederalBracketDetails(
      state.country,
      grossAnnual,
    );
    const provincialStateBrackets = getProvincialStateBracketDetails(
      state.country,
      state.region,
      grossAnnual,
    );

    const netBaseAnnual = calcNetAnnual(grossAnnual, taxBreakdownBase.total);

    // Extras handling
    const signOnYears = Math.max(1, state.signOnYears || 1);
    const signOnAnnualized = state.signOnBonus / signOnYears;

    const equityAnnualized =
      state.equityMode === "annual"
        ? state.equityAnnualValue
        : state.equityVestYears > 0
          ? state.equityGrantValue / state.equityVestYears
          : 0;

    const extrasTaxTreatment = state.extrasTaxTreatment;
    const extraAmounts = {
      bonus: state.annualBonus,
      signOn: signOnAnnualized,
      stipend: state.stipendAnnual,
      match: state.employerMatchAnnual,
    };

    const extrasCashTaxable =
      (extrasTaxTreatment.bonus === "taxable" ? extraAmounts.bonus : 0) +
      (extrasTaxTreatment.signOn === "taxable" ? extraAmounts.signOn : 0) +
      (extrasTaxTreatment.stipend === "taxable" ? extraAmounts.stipend : 0) +
      (extrasTaxTreatment.match === "taxable" ? extraAmounts.match : 0);

    const extrasCashNonTaxable =
      (extrasTaxTreatment.bonus === "nonTaxable" ? extraAmounts.bonus : 0) +
      (extrasTaxTreatment.signOn === "nonTaxable" ? extraAmounts.signOn : 0) +
      (extrasTaxTreatment.stipend === "nonTaxable" ? extraAmounts.stipend : 0) +
      (extrasTaxTreatment.match === "nonTaxable" ? extraAmounts.match : 0);

    const extrasNonCash =
      (extrasTaxTreatment.bonus === "nonCash" ? extraAmounts.bonus : 0) +
      (extrasTaxTreatment.signOn === "nonCash" ? extraAmounts.signOn : 0) +
      (extrasTaxTreatment.stipend === "nonCash" ? extraAmounts.stipend : 0) +
      (extrasTaxTreatment.match === "nonCash" ? extraAmounts.match : 0) +
      equityAnnualized;

    const grossTaxableAnnual = grossAnnual + extrasCashTaxable;
    const taxBreakdownWithExtras = getTaxBreakdown(
      state.country,
      state.region,
      grossTaxableAnnual,
      state.isSelfEmployed,
    );
    const extrasTax = Math.max(
      0,
      taxBreakdownWithExtras.total - taxBreakdownBase.total,
    );

    const grossCashAnnual =
      grossAnnual + extrasCashTaxable + extrasCashNonTaxable;
    const netCashAnnual =
      netBaseAnnual + extrasCashTaxable + extrasCashNonTaxable - extrasTax;
    const totalCompAnnual = netCashAnnual + extrasNonCash;

    // Sanitize all numeric values to prevent NaN from propagating to UI
    const safe = (n: number) => (Number.isFinite(n) ? n : 0);

    return {
      billableHours: safe(billableHours),
      grossAnnual: safe(grossAnnual),
      netAnnual: safe(netBaseAnnual),
      grossBaseAnnual: safe(grossAnnual),
      netBaseAnnual: safe(netBaseAnnual),
      grossTaxableAnnual: safe(grossTaxableAnnual),
      grossCashAnnual: safe(grossCashAnnual),
      extrasCashTaxable: safe(extrasCashTaxable),
      extrasCashNonTaxable: safe(extrasCashNonTaxable),
      extrasNonCash: safe(extrasNonCash),
      netCashAnnual: safe(netCashAnnual),
      totalCompAnnual: safe(totalCompAnnual),
      equityAnnualized: safe(equityAnnualized),
      extrasTax: safe(extrasTax),
      taxBreakdownBase,
      taxBreakdown: taxBreakdownBase,
      federalBrackets,
      provincialStateBrackets,
      calculatedHourlyRate: safe(calculatedHourlyRate),
      effectiveHourlyMin: safe(effectiveHourlyMin),
      effectiveHourlyMax: safe(effectiveHourlyMax),
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
    state.useFixedMonthlyHours,
    state.fixedMonthlyHours,
    state.annualBonus,
    state.signOnBonus,
    state.signOnYears,
    state.stipendAnnual,
    state.employerMatchAnnual,
    state.equityMode,
    state.equityAnnualValue,
    state.equityGrantValue,
    state.equityVestYears,
    state.extrasTaxTreatment,
  ]);
}
