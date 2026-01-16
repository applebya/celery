import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Calculator } from './Calculator'
import { useCalculation } from '@/hooks/useCalculation'
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
  const [activeTab, setActiveTab] = useState<string>('scenario-1')
  const leftCalc = useCalculation(leftState)
  const rightCalc = useCalculation(rightState ?? DEFAULT_STATE)

  const addScenario = () => {
    onRightChange({
      ...leftState,
      title: 'New Offer',
      // Slightly different to demonstrate comparison
      hourlyRate: Math.round(leftState.hourlyRate * 1.1),
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
  // Determine winner based on net annual income
  const winner = netDifference > 0 ? 'right' : netDifference < 0 ? 'left' : null

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
            className="flex items-center gap-2 px-4 py-2 text-base font-medium text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors"
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

        <TabsContent value="compare" className="space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr,1fr,auto] gap-4 text-center">
            <div className="font-semibold text-lg">{leftState.title || 'Scenario 1'}</div>
            <div className="font-semibold text-lg">{rightState.title || 'Scenario 2'}</div>
            <div className="w-20"></div>
          </div>

          {/* Gross Annual Row */}
          <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center py-3 border-b">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Gross Annual</p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(leftCalc.grossAnnual, leftState.currency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Gross Annual</p>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(rightCalc.grossAnnual, rightState.currency)}
              </p>
            </div>
            <div className="w-20 text-right">
              <span className={`text-sm font-medium ${
                rightCalc.grossAnnual >= leftCalc.grossAnnual ? 'text-green-600' : 'text-red-600'
              }`}>
                {rightCalc.grossAnnual >= leftCalc.grossAnnual ? '+' : ''}
                {leftCalc.grossAnnual > 0 ? (((rightCalc.grossAnnual - leftCalc.grossAnnual) / leftCalc.grossAnnual) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>

          {/* Net Annual Row */}
          <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center py-3 border-b">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Net Annual (Take-home)</p>
              <p className={`text-3xl font-bold tabular-nums ${winner === 'left' ? 'text-green-600' : ''}`}>
                {formatCurrency(leftCalc.netAnnual, leftState.currency)}
                {winner === 'left' && <span className="ml-2 text-sm">●</span>}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Net Annual (Take-home)</p>
              <p className={`text-3xl font-bold tabular-nums ${winner === 'right' ? 'text-green-600' : ''}`}>
                {formatCurrency(rightCalc.netAnnual, rightState.currency)}
                {winner === 'right' && <span className="ml-2 text-sm">●</span>}
              </p>
            </div>
            <div className="w-20 text-right">
              <span className={`text-sm font-medium ${
                netDifference >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {netPercentChange >= 0 ? '+' : ''}{netPercentChange.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Effective Hourly Row */}
          <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center py-3 border-b">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Effective Hourly</p>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(leftCalc.billableHours > 0 ? leftCalc.netAnnual / leftCalc.billableHours : 0, leftState.currency)}/hr
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Effective Hourly</p>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(rightCalc.billableHours > 0 ? rightCalc.netAnnual / rightCalc.billableHours : 0, rightState.currency)}/hr
              </p>
            </div>
            <div className="w-20 text-right">
              {(() => {
                const leftHourly = leftCalc.billableHours > 0 ? leftCalc.netAnnual / leftCalc.billableHours : 0
                const rightHourly = rightCalc.billableHours > 0 ? rightCalc.netAnnual / rightCalc.billableHours : 0
                const hourlyDiff = leftHourly > 0 ? ((rightHourly - leftHourly) / leftHourly) * 100 : 0
                return (
                  <span className={`text-sm font-medium ${rightHourly >= leftHourly ? 'text-green-600' : 'text-red-600'}`}>
                    {hourlyDiff >= 0 ? '+' : ''}{hourlyDiff.toFixed(1)}%
                  </span>
                )
              })()}
            </div>
          </div>

          {/* Hours/Year Row */}
          <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center py-3 border-b">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Hours/Year</p>
              <p className="text-lg font-medium tabular-nums">
                {leftCalc.billableHours.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Hours/Year</p>
              <p className="text-lg font-medium tabular-nums">
                {rightCalc.billableHours.toLocaleString()}
              </p>
            </div>
            <div className="w-20 text-right">
              {(() => {
                const hoursDiff = leftCalc.billableHours > 0 ? ((rightCalc.billableHours - leftCalc.billableHours) / leftCalc.billableHours) * 100 : 0
                // For hours, less is better (more free time)
                return (
                  <span className={`text-sm font-medium ${rightCalc.billableHours <= leftCalc.billableHours ? 'text-green-600' : 'text-red-600'}`}>
                    {hoursDiff >= 0 ? '+' : ''}{hoursDiff.toFixed(1)}%
                  </span>
                )
              })()}
            </div>
          </div>

          {/* Verdict */}
          <Card className="bg-muted/50">
            <CardContent className="py-4 text-center">
              {winner ? (
                <p className="text-lg">
                  <span className="font-semibold">{winner === 'right' ? (rightState.title || 'Scenario 2') : (leftState.title || 'Scenario 1')}</span>
                  {' pays '}
                  <span className="font-bold text-green-600">
                    {formatCurrency(Math.abs(netDifference), leftState.currency)}
                  </span>
                  {' more annually (net)'}
                </p>
              ) : (
                <p className="text-lg text-muted-foreground">Both scenarios have equal net pay</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
