import { useState, useCallback, useEffect } from "react";
import type {
  CalculatorState,
  Currency,
  EmploymentType,
  SavedScenario,
} from "@/types";
import { DEFAULT_STATE } from "@/types";

const STORAGE_KEY = "celery-scenarios";
const MAX_SCENARIOS = 10;

// Generate a simple unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Generate scenario name based on position
function getScenarioName(index: number): string {
  if (index === 0) return "Current Job";
  if (index === 1) return "New Job";
  // Third+ scenarios: New Job B, New Job C, etc.
  const letter = String.fromCharCode(64 + index); // 2->B, 3->C, etc.
  return `New Job ${letter}`;
}

function loadScenarios(): SavedScenario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (s: unknown): s is SavedScenario =>
            typeof s === "object" &&
            s !== null &&
            typeof (s as SavedScenario).id === "string" &&
            typeof (s as SavedScenario).state === "object",
        )
        .map((scenario) => ({
          ...scenario,
          name: typeof scenario.name === "string" ? scenario.name : "Untitled",
          state: normalizeState(scenario.state),
        }));
    }
  } catch {
    // Invalid data, start fresh
  }
  return [];
}

function persistScenarios(scenarios: SavedScenario[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

function normalizeState(
  state: CalculatorState | Partial<CalculatorState>,
): CalculatorState {
  const merged = {
    ...DEFAULT_STATE,
    ...state,
    extrasTaxTreatment: {
      ...DEFAULT_STATE.extrasTaxTreatment,
      ...(state as CalculatorState).extrasTaxTreatment,
    },
  };

  // Sanitize numeric fields — guard against NaN/Infinity from corrupt localStorage
  const numericDefaults: Partial<Record<keyof CalculatorState, number>> = {
    hourlyRate: DEFAULT_STATE.hourlyRate,
    hoursPerDay: DEFAULT_STATE.hoursPerDay,
    daysPerWeek: DEFAULT_STATE.daysPerWeek,
    holidaysPerYear: DEFAULT_STATE.holidaysPerYear,
    ptoDays: DEFAULT_STATE.ptoDays,
    sickDays: DEFAULT_STATE.sickDays,
    targetSalary: DEFAULT_STATE.targetSalary,
    monthlyRetainer: DEFAULT_STATE.monthlyRetainer,
    expectedHoursMin: DEFAULT_STATE.expectedHoursMin,
    expectedHoursMax: DEFAULT_STATE.expectedHoursMax,
    fixedMonthlyHours: DEFAULT_STATE.fixedMonthlyHours,
    traderMargin: DEFAULT_STATE.traderMargin,
    annualBonus: DEFAULT_STATE.annualBonus,
    signOnBonus: DEFAULT_STATE.signOnBonus,
    signOnYears: DEFAULT_STATE.signOnYears,
    stipendAnnual: DEFAULT_STATE.stipendAnnual,
    employerMatchAnnual: DEFAULT_STATE.employerMatchAnnual,
    equityAnnualValue: DEFAULT_STATE.equityAnnualValue,
    equityGrantValue: DEFAULT_STATE.equityGrantValue,
    equityVestYears: DEFAULT_STATE.equityVestYears,
    equityCliffMonths: DEFAULT_STATE.equityCliffMonths,
  };

  for (const [key, fallback] of Object.entries(numericDefaults)) {
    const val = merged[key as keyof CalculatorState];
    if (typeof val !== "number" || !Number.isFinite(val)) {
      (merged as Record<string, unknown>)[key] = fallback;
    }
  }

  // Sanitize enum/string fields
  const validCurrencies: Currency[] = [
    "CAD",
    "USD",
    "EUR",
    "GBP",
    "AUD",
    "NZD",
    "CHF",
    "JPY",
    "INR",
    "BRL",
    "MXN",
    "SGD",
    "HKD",
    "SEK",
    "NOK",
    "DKK",
    "PLN",
    "CZK",
    "ILS",
    "ZAR",
  ];
  if (!validCurrencies.includes(merged.currency)) {
    merged.currency = DEFAULT_STATE.currency;
  }
  if (!validCurrencies.includes(merged.displayCurrency)) {
    merged.displayCurrency = DEFAULT_STATE.displayCurrency;
  }

  const validCountries: Array<"CA" | "US" | "OTHER"> = ["CA", "US", "OTHER"];
  if (!validCountries.includes(merged.country)) {
    merged.country = DEFAULT_STATE.country;
  }

  const validEmploymentTypes: EmploymentType[] = [
    "contractor-hourly",
    "contractor-retainer",
    "employee-hourly",
    "employee-salary",
  ];
  if (!validEmploymentTypes.includes(merged.employmentType)) {
    merged.employmentType = DEFAULT_STATE.employmentType;
  }

  const validCalcModes: Array<"hourlyToSalary" | "salaryToHourly"> = [
    "hourlyToSalary",
    "salaryToHourly",
  ];
  if (!validCalcModes.includes(merged.calculationMode)) {
    merged.calculationMode = DEFAULT_STATE.calculationMode;
  }

  const validEquityModes: Array<"annual" | "vesting"> = ["annual", "vesting"];
  if (!validEquityModes.includes(merged.equityMode)) {
    merged.equityMode = DEFAULT_STATE.equityMode;
  }

  // Sanitize booleans
  const booleanFields: Array<keyof CalculatorState> = [
    "showTaxEstimate",
    "isSelfEmployed",
    "unlimitedPTO",
    "showCurrencyConversion",
    "useFixedMonthlyHours",
  ];
  for (const key of booleanFields) {
    if (typeof merged[key] !== "boolean") {
      (merged as Record<string, unknown>)[key] = DEFAULT_STATE[key];
    }
  }

  return merged;
}

export function useScenarios() {
  const [scenarios, setScenarios] = useState<SavedScenario[]>(() =>
    loadScenarios(),
  );
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(
    () => {
      const loaded = loadScenarios();
      return loaded.length > 0 ? loaded[0].id : null;
    },
  );

  // Persist whenever scenarios change
  useEffect(() => {
    persistScenarios(scenarios);
  }, [scenarios]);

  const saveScenario = useCallback(
    (state: CalculatorState, id?: string): string => {
      const now = Date.now();
      const normalizedState = normalizeState(state);

      setScenarios((prev) => {
        // If updating existing scenario
        if (id) {
          const existing = prev.find((s) => s.id === id);
          if (existing) {
            return prev.map((s) =>
              s.id === id
                ? {
                    ...s,
                    state: normalizedState,
                    updatedAt: now,
                  }
                : s,
            );
          }
        }

        // Create new scenario
        const newId = generateId();
        const newScenario: SavedScenario = {
          id: newId,
          name: getScenarioName(prev.length),
          state: normalizedState,
          createdAt: now,
          updatedAt: now,
        };

        // Add to end, enforce max limit (remove oldest)
        const updated = [...prev, newScenario];
        if (updated.length > MAX_SCENARIOS) {
          return updated.slice(0, MAX_SCENARIOS);
        }
        return updated;
      });

      return id ?? generateId();
    },
    [],
  );

  const loadScenario = useCallback(
    (id: string): CalculatorState | null => {
      const scenario = scenarios.find((s) => s.id === id);
      if (scenario) {
        setActiveScenarioId(id);
        return normalizeState(scenario.state);
      }
      return null;
    },
    [scenarios],
  );

  const deleteScenario = useCallback(
    (id: string): void => {
      setScenarios((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        return updated;
      });

      // If we deleted the active scenario, switch to first remaining or null
      if (activeScenarioId === id) {
        setScenarios((prev) => {
          setActiveScenarioId(prev.length > 0 ? prev[0].id : null);
          return prev;
        });
      }
    },
    [activeScenarioId],
  );

  const renameScenario = useCallback((id: string, name: string): void => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const createScenario = useCallback((baseState?: CalculatorState): string => {
    const state = normalizeState(baseState ?? DEFAULT_STATE);
    const now = Date.now();
    const newId = generateId();

    setScenarios((prev) => {
      const newScenario: SavedScenario = {
        id: newId,
        name: getScenarioName(prev.length), // Use prev.length for accurate count
        state,
        createdAt: now,
        updatedAt: now,
      };

      const updated = [...prev, newScenario];
      if (updated.length > MAX_SCENARIOS) {
        return updated.slice(0, MAX_SCENARIOS);
      }
      return updated;
    });

    setActiveScenarioId(newId);
    return newId;
  }, []);

  const getActiveScenario = useCallback((): SavedScenario | null => {
    if (!activeScenarioId) return null;
    return scenarios.find((s) => s.id === activeScenarioId) ?? null;
  }, [scenarios, activeScenarioId]);

  const updateActiveScenario = useCallback(
    (state: CalculatorState): void => {
      if (!activeScenarioId) return;

      setScenarios((prev) =>
        prev.map((s) =>
          s.id === activeScenarioId
            ? { ...s, state: normalizeState(state), updatedAt: Date.now() }
            : s,
        ),
      );
    },
    [activeScenarioId],
  );

  const updateAllScenarios = useCallback(
    (updates: Partial<CalculatorState>): void => {
      setScenarios((prev) =>
        prev.map((s) => ({
          ...s,
          state: { ...s.state, ...updates },
          updatedAt: Date.now(),
        })),
      );
    },
    [],
  );

  return {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    saveScenario,
    loadScenario,
    deleteScenario,
    renameScenario,
    createScenario,
    getActiveScenario,
    updateActiveScenario,
    updateAllScenarios,
  };
}
