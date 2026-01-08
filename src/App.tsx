import { ComparisonView } from '@/components/ComparisonView'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { DEFAULT_STATE, type CalculatorState } from '@/types'

const STORAGE_KEY_LEFT = 'celery-calculator-left'
const STORAGE_KEY_RIGHT = 'celery-calculator-right'

function App() {
  const [leftState, setLeftState] = useLocalStorage<CalculatorState>(
    STORAGE_KEY_LEFT,
    { ...DEFAULT_STATE, title: 'Current' }
  )
  const [rightState, setRightState] = useLocalStorage<CalculatorState | null>(
    STORAGE_KEY_RIGHT,
    null
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <span className="text-4xl">🥬</span>
            Celery
          </h1>
          <p className="text-muted-foreground mt-1">
            Contractor Salary Calculator
          </p>
        </header>

        {/* Calculator */}
        <main>
          <ComparisonView
            leftState={leftState}
            rightState={rightState}
            onLeftChange={setLeftState}
            onRightChange={setRightState}
          />
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-muted-foreground space-y-1">
          <p>
            2026 tax rates for Canada & USA · Estimates only
          </p>
          <p className="flex items-center justify-center gap-1">
            <span>💾</span>
            <span>Preferences saved locally</span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
