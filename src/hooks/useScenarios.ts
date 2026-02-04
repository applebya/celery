import { useState, useCallback, useEffect } from "react";
import type { CalculatorState, SavedScenario } from "@/types";
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
          state,
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

  const createScenario = useCallback((baseState?: CalculatorState): string => {
    const state = baseState ?? DEFAULT_STATE;
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
