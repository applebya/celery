import { Plus, X, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calculator } from './Calculator'
import { useCalculation } from '@/hooks/useCalculation'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { formatCurrency } from '@/lib/calculate'
import type { CalculatorState } from '@/types'
import { DEFAULT_STATE } from '@/types'

interface ComparisonViewProps {
  leftState: CalculatorState
  rightState: CalculatorState | null
  onLeftChange: (state: CalculatorState) => void
  onRightChange: (state: CalculatorState | null) => void
}

export function ComparisonView({
  leftState,
  rightState,
  onLeftChange,
  onRightChange,
}: ComparisonViewProps) {
  const leftCalc = useCalculation(leftState)
  const rightCalc = useCalculation(rightState ?? DEFAULT_STATE)
  const { convertCurrency, exchangeRate } = useExchangeRate()

  const addComparison = () => {
    onRightChange({
      ...DEFAULT_STATE,
      title: 'New Scenario',
    })
  }

  const removeComparison = () => {
    onRightChange(null)
  }

  const isComparing = rightState !== null

  // Calculate difference
  const netDifference = isComparing ? rightCalc.netAnnual - leftCalc.netAnnual : 0
  const netPercentChange = isComparing && leftCalc.netAnnual > 0
    ? ((rightCalc.netAnnual - leftCalc.netAnnual) / leftCalc.netAnnual) * 100
    : 0
  const otherCurrency = leftState.currency === 'CAD' ? 'USD' : 'CAD'
  const convertedDifference = convertCurrency(Math.abs(netDifference), leftState.currency, otherCurrency)

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${isComparing ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
        {/* Left Calculator */}
        <div className="space-y-2">
          <Calculator
            state={leftState}
            onChange={onLeftChange}
            showTitle={isComparing}
          />
        </div>

        {/* Right Calculator (if comparing) */}
        {isComparing && rightState && (
          <div className="space-y-2 relative">
            <button
              onClick={removeComparison}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 z-10"
              title="Remove comparison"
            >
              <X className="h-4 w-4" />
            </button>
            <Calculator
              state={rightState}
              onChange={(s) => onRightChange(s)}
              showTitle={true}
            />
          </div>
        )}
      </div>

      {/* Comparison Summary */}
      {isComparing && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Net Difference</p>
                <p className={`text-xl font-bold flex items-center justify-center gap-1 ${
                  netDifference >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {netDifference >= 0 ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                  {netDifference >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(netDifference), leftState.currency)}
                </p>
                {exchangeRate && (
                  <p className="text-sm text-muted-foreground">
                    = {netDifference >= 0 ? '+' : '-'}{formatCurrency(convertedDifference, otherCurrency)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  ({netPercentChange >= 0 ? '+' : ''}{netPercentChange.toFixed(1)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Comparison Button */}
      {!isComparing && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={addComparison} className="gap-2">
            <Plus className="h-4 w-4" />
            Compare Scenarios
          </Button>
        </div>
      )}
    </div>
  )
}
