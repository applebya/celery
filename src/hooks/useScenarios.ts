import { useState, useCallback, useEffect } from "react";
import type { CalculatorState, SavedScenario } from "@/types";
import { DEFAULT_STATE } from "@/types";
import { getCountry } from "@/data/holidays-2026";

const STORAGE_KEY = "celery-scenarios";
const MAX_SCENARIOS = 10;

// Generate a simple unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Auto-generate scenario name from state
export function generateScenarioName(state: CalculatorState): string {
  const country = getCountry(state.country);
  const regionName =
    country?.regions.find((r) => r.code === state.region)?.name ?? state.region;

  if (state.calculationMode === "hourlyToSalary") {
    return `$${state.hourlyRate}/hr · ${regionName}`;
  } else {
    const salaryK = Math.round(state.targetSalary / 1000);
    return `$${salaryK}k target · ${regionName}`;
  }
}

function loadScenarios(): SavedScenario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid data, start fresh
  }
  return [];
}

function persistScenarios(scenarios: SavedScenario[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
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

      setScenarios((prev) => {
        // If updating existing scenario
        if (id) {
          const existing = prev.find((s) => s.id === id);
          if (existing) {
            return prev.map((s) =>
              s.id === id
                ? {
                    ...s,
                    state,
                    updatedAt: now,
                    name: s.name || generateScenarioName(state),
                  }
                : s,
            );
          }
        }

        // Create new scenario
        const newId = generateId();
        const newScenario: SavedScenario = {
          id: newId,
          name: generateScenarioName(state),
          state,
          createdAt: now,
          updatedAt: now,
        };

        // Add to front, enforce max limit (remove oldest)
        const updated = [newScenario, ...prev];
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
        return scenario.state;
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

  const createScenario = useCallback(
    (baseState?: CalculatorState): string => {
      const state = baseState ?? DEFAULT_STATE;
      const now = Date.now();
      const newId = generateId();

      // Generate "Job A", "Job B" style name based on existing count
      const jobLetter = String.fromCharCode(65 + scenarios.length);
      const defaultName = `Job ${jobLetter}`;

      const newScenario: SavedScenario = {
        id: newId,
        name: baseState ? generateScenarioName(state) : defaultName,
        state,
        createdAt: now,
        updatedAt: now,
      };

      setScenarios((prev) => {
        const updated = [...prev, newScenario];
        if (updated.length > MAX_SCENARIOS) {
          return updated.slice(0, MAX_SCENARIOS);
        }
        return updated;
      });

      setActiveScenarioId(newId);
      return newId;
    },
    [scenarios.length],
  );

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
            ? { ...s, state, updatedAt: Date.now() }
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
