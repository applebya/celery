import { ComparisonView } from '@/components/ComparisonView'
import { ThemeToggle } from '@/components/ThemeToggle'
import { OnboardingTour } from '@/components/OnboardingTour'
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
      <OnboardingTour />
      <div className="container max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-semibold tracking-tight">Celery</h1>
            <span className="text-xs text-muted-foreground">Salary Calculator</span>
          </div>
          <ThemeToggle />
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
        <footer className="text-center mt-6 text-[10px] text-muted-foreground">
          <p>2026 tax rates · Estimates only · Saved locally</p>
        </footer>
      </div>
    </div>
  )
}

export default App
