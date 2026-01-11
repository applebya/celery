import { ComparisonView } from '@/components/ComparisonView'
import { ThemeToggle } from '@/components/ThemeToggle'
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
        <header className="relative text-center mb-8">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Celery
          </h1>
          <p className="text-sm text-muted-foreground">
            Salary Calculator
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
        <footer className="text-center mt-12 text-xs text-muted-foreground">
          <p>2026 tax rates · Estimates only · Saved locally</p>
        </footer>
      </div>
    </div>
  )
}

export default App
