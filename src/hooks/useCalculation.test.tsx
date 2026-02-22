import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCalculation } from "./useCalculation";
import { DEFAULT_STATE } from "@/types";

describe("useCalculation extras", () => {
  it("classifies extras into taxable, non-taxable, and non-cash", () => {
    const state = {
      ...DEFAULT_STATE,
      hourlyRate: 100,
      annualBonus: 10000,
      signOnBonus: 12000,
      signOnYears: 2,
      stipendAnnual: 2000,
      employerMatchAnnual: 3000,
      equityMode: "annual",
      equityAnnualValue: 5000,
      extrasTaxTreatment: {
        bonus: "taxable",
        signOn: "nonTaxable",
        stipend: "nonCash",
        match: "nonCash",
        equity: "nonCash",
      },
    } as const;

    const { result } = renderHook(() => useCalculation(state));

    expect(result.current.extrasCashTaxable).toBe(10000);
    expect(result.current.extrasCashNonTaxable).toBe(6000);
    expect(result.current.extrasNonCash).toBe(10000);
    expect(result.current.totalCompAnnual).toBeCloseTo(
      result.current.netCashAnnual + result.current.extrasNonCash,
      2,
    );
  });

  it("annualizes equity grants in vesting mode", () => {
    const state = {
      ...DEFAULT_STATE,
      equityMode: "vesting",
      equityGrantValue: 48000,
      equityVestYears: 4,
    } as const;

    const { result } = renderHook(() => useCalculation(state));
    expect(result.current.equityAnnualized).toBe(12000);
  });
});
