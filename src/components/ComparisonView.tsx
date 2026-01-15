import { useState } from 'react'
import { Plus, X, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Calculator } from './Calculator'
import { useCalculation } from '@/hooks/useCalculation'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { formatCurrency } from '@/lib/calculate'
import type { CalculatorState, Currency } from '@/types'
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
  const [activeTab, setActiveTab] = useState<string>('scenario-1')
  const leftCalc = useCalculation(leftState)
  const rightCalc = useCalculation(rightState ?? DEFAULT_STATE)
  const { convertCurrency, exchangeRates } = useExchangeRate()

  const addScenario = () => {
    onRightChange({
      ...DEFAULT_STATE,
      title: 'New Offer',
    })
    setActiveTab('scenario-2')
  }

  const removeScenario = () => {
    onRightChange(null)
    setActiveTab('scenario-1')
  }

  const isComparing = rightState !== null

  // Calculate difference
  const netDifference = isComparing ? rightCalc.netAnnual - leftCalc.netAnnual : 0
  const netPercentChange = isComparing && leftCalc.netAnnual > 0
    ? ((rightCalc.netAnnual - leftCalc.netAnnual) / leftCalc.netAnnual) * 100
    : 0
  const otherCurrency: Currency = leftState.currency === 'USD' ? 'CAD'
    : leftState.currency === 'CAD' ? 'USD'
    : 'USD'
  const convertedDifference = convertCurrency(Math.abs(netDifference), leftState.currency, otherCurrency)

  // Single calculator mode (no comparison)
  if (!isComparing) {
    return (
      <div className="space-y-4">
        <div className="max-w-md mx-auto">
          <Calculator
            state={leftState}
            onChange={onLeftChange}
            showTitle={false}
          />
        </div>
        <div className="flex justify-center">
          <button
            onClick={addScenario}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Compare Job Offers
          </button>
        </div>
      </div>
    )
  }

  // Comparison mode with tabs
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="scenario-1" className="min-w-24">
              {leftState.title || 'Scenario 1'}
            </TabsTrigger>
            <TabsTrigger value="scenario-2" className="min-w-24 relative group">
              {rightState.title || 'Scenario 2'}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeScenario()
                }}
                className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                title="Remove scenario"
                aria-label="Remove scenario"
              >
                <X className="h-4 w-4" />
              </button>
            </TabsTrigger>
            <TabsTrigger value="compare" className="min-w-24">
              Compare
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="scenario-1" className="max-w-md mx-auto">
          <Calculator
            state={leftState}
            onChange={onLeftChange}
            showTitle={true}
          />
        </TabsContent>

        <TabsContent value="scenario-2" className="max-w-md mx-auto">
          <Calculator
            state={rightState}
            onChange={(s) => onRightChange(s)}
            showTitle={true}
          />
        </TabsContent>

        <TabsContent value="compare">
          {/* Side by side comparison */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-center mb-4">{leftState.title || 'Scenario 1'}</h3>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">{formatCurrency(leftCalc.grossAnnual, leftState.currency)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    After tax: {formatCurrency(leftCalc.netAnnual, leftState.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leftCalc.billableHours.toLocaleString()} hrs/yr
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-center mb-4">{rightState.title || 'Scenario 2'}</h3>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">{formatCurrency(rightCalc.grossAnnual, rightState.currency)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    After tax: {formatCurrency(rightCalc.netAnnual, rightState.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rightCalc.billableHours.toLocaleString()} hrs/yr
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Difference summary */}
          <Card className="mt-4 bg-muted/50">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {rightState.title || 'Scenario 2'} vs {leftState.title || 'Scenario 1'}
                  </p>
                  <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                    netDifference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {netDifference >= 0 ? (
                      <ArrowUpRight className="h-6 w-6" />
                    ) : (
                      <ArrowDownRight className="h-6 w-6" />
                    )}
                    {netDifference >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(netDifference), leftState.currency)}
                  </p>
                  {exchangeRates && (
                    <p className="text-sm text-muted-foreground mt-1">
                      = {netDifference >= 0 ? '+' : '-'}{formatCurrency(convertedDifference, otherCurrency)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    ({netPercentChange >= 0 ? '+' : ''}{netPercentChange.toFixed(1)}% after tax)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
