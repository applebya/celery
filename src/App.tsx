import { useState, useEffect, useCallback, useRef } from 'react'
import { ComparisonView } from '@/components/ComparisonView'
import { ThemeToggle } from '@/components/ThemeToggle'
import { OnboardingTour } from '@/components/OnboardingTour'
import { ScenarioSwitcher } from '@/components/ScenarioSwitcher'
import { FooterContent } from '@/components/FooterContent'
import { useScenarios } from '@/hooks/useScenarios'
import { DEFAULT_STATE, type CalculatorState } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

// Legacy storage keys for migration
const LEGACY_STORAGE_KEY_LEFT = 'celery-calculator-left'
const LEGACY_STORAGE_KEY_RIGHT = 'celery-calculator-right'

function App() {
  const {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    createScenario,
    deleteScenario,
    renameScenario,
    updateActiveScenario,
    getActiveScenario,
  } = useScenarios()

  // Track comparison mode separately
  const [rightState, setRightState] = useState<CalculatorState | null>(null)

  // Auto-save indicator
  const [showSaved, setShowSaved] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Migrate legacy data on first load
  useEffect(() => {
    if (scenarios.length === 0) {
      // Check for legacy data
      const legacyLeft = localStorage.getItem(LEGACY_STORAGE_KEY_LEFT)
      if (legacyLeft) {
        try {
          const state = JSON.parse(legacyLeft) as CalculatorState
          createScenario(state)
          // Clean up legacy keys after migration
          localStorage.removeItem(LEGACY_STORAGE_KEY_LEFT)
          localStorage.removeItem(LEGACY_STORAGE_KEY_RIGHT)
        } catch {
          // Invalid data, create fresh scenario
          createScenario()
        }
      } else {
        // No legacy data, create first scenario
        createScenario()
      }
    }
  }, [scenarios.length, createScenario])

  // Get current state from active scenario
  const activeScenario = getActiveScenario()
  const currentState = activeScenario?.state ?? DEFAULT_STATE

  // Debounced auto-save handler
  const handleStateChange = useCallback((newState: CalculatorState) => {
    updateActiveScenario(newState)

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the "Saved" indicator
    debounceRef.current = setTimeout(() => {
      setShowSaved(true)

      // Hide after 1.5s
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        setShowSaved(false)
      }, 1500)
    }, 1000)
  }, [updateActiveScenario])

  const handleSelectScenario = useCallback((id: string) => {
    setActiveScenarioId(id)
  }, [setActiveScenarioId])

  const handleCreateScenario = useCallback(() => {
    createScenario()
  }, [createScenario])

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour />
      <div className="container max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-semibold tracking-tight">Celery</h1>
            <span className="text-xs text-muted-foreground">Salary Calculator</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            <AnimatePresence>
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
                >
                  <Check className="h-3 w-3" />
                  Saved
                </motion.div>
              )}
            </AnimatePresence>
            <ThemeToggle />
          </div>
        </header>

        {/* Scenario Switcher */}
        <ScenarioSwitcher
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelect={handleSelectScenario}
          onDelete={deleteScenario}
          onRename={renameScenario}
          onCreate={handleCreateScenario}
        />

        {/* Calculator */}
        <main>
          <ComparisonView
            leftState={currentState}
            rightState={rightState}
            onLeftChange={handleStateChange}
            onRightChange={setRightState}
            scenarios={scenarios}
          />
        </main>

        {/* Below-the-fold SEO content */}
        <FooterContent />

        {/* Footer */}
        <footer className="text-center mt-8 pb-4 text-[10px] text-muted-foreground">
          <p>2026 tax rates · Estimates only · Saved locally</p>
        </footer>
      </div>
    </div>
  )
}

export default App
