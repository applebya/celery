import { useState, useMemo } from 'react'
import { ArrowLeftRight, ChevronRight, ChevronLeft, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calculator } from './Calculator'
import { useCalculation } from '@/hooks/useCalculation'
import { formatCurrency } from '@/lib/calculate'
import type { CalculatorState, SavedScenario, Currency } from '@/types'
import { DEFAULT_STATE } from '@/types'

interface ComparisonViewProps {
  leftState: CalculatorState
  rightState: CalculatorState | null
  onLeftChange: (state: CalculatorState) => void
  onRightChange: (state: CalculatorState | null) => void
  scenarios?: SavedScenario[]
}

export function ComparisonView({
  leftState,
  rightState,
  onLeftChange,
  onRightChange,
  scenarios = [],
}: ComparisonViewProps) {
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [leftScenarioId, setLeftScenarioId] = useState<string | null>(null)
  const [rightScenarioId, setRightScenarioId] = useState<string | null>(null)

  // Get states from selected scenarios or fallback to props
  const leftCompareState = useMemo(() => {
    if (leftScenarioId) {
      const scenario = scenarios.find(s => s.id === leftScenarioId)
      return scenario?.state ?? leftState
    }
    return leftState
  }, [leftScenarioId, scenarios, leftState])

  const rightCompareState = useMemo(() => {
    if (rightScenarioId) {
      const scenario = scenarios.find(s => s.id === rightScenarioId)
      return scenario?.state ?? rightState ?? DEFAULT_STATE
    }
    return rightState ?? DEFAULT_STATE
  }, [rightScenarioId, scenarios, rightState])

  const leftCalc = useCalculation(leftCompareState)
  const rightCalc = useCalculation(rightCompareState)

  const enterCompareMode = () => {
    // Auto-select first two scenarios if available
    if (scenarios.length >= 2) {
      setLeftScenarioId(scenarios[0].id)
      setRightScenarioId(scenarios[1].id)
    } else if (scenarios.length === 1) {
      setLeftScenarioId(scenarios[0].id)
    }
    setIsCompareMode(true)
  }

  const exitCompareMode = () => {
    setIsCompareMode(false)
    setLeftScenarioId(null)
    setRightScenarioId(null)
    onRightChange(null)
  }

  // Calculate differences
  const netDifference = rightCalc.netAnnual - leftCalc.netAnnual
  const netPercentChange = leftCalc.netAnnual > 0
    ? ((rightCalc.netAnnual - leftCalc.netAnnual) / leftCalc.netAnnual) * 100
    : 0
  const hoursDifference = rightCalc.billableHours - leftCalc.billableHours
  const hoursPercentChange = leftCalc.billableHours > 0
    ? ((rightCalc.billableHours - leftCalc.billableHours) / leftCalc.billableHours) * 100
    : 0

  // Determine winner based on net annual income
  const winner = netDifference > 0 ? 'right' : netDifference < 0 ? 'left' : null

  // Calculate effective hourly rates
  const leftEffectiveHourly = leftCalc.billableHours > 0 ? leftCalc.netAnnual / leftCalc.billableHours : 0
  const rightEffectiveHourly = rightCalc.billableHours > 0 ? rightCalc.netAnnual / rightCalc.billableHours : 0
  const effectiveHourlyWinner = rightEffectiveHourly > leftEffectiveHourly ? 'right' : rightEffectiveHourly < leftEffectiveHourly ? 'left' : null

  // Mini bar helper - returns width percentage (0-100)
  const getBarWidth = (value: number, maxValue: number) => {
    if (maxValue === 0) return 50
    return Math.max(10, Math.min(100, (value / maxValue) * 100))
  }

  const maxNet = Math.max(leftCalc.netAnnual, rightCalc.netAnnual)
  const maxGross = Math.max(leftCalc.grossAnnual, rightCalc.grossAnnual)
  const maxHourly = Math.max(leftEffectiveHourly, rightEffectiveHourly)
  const maxHours = Math.max(leftCalc.billableHours, rightCalc.billableHours)

  // Get scenario names for display
  const getScenarioName = (id: string | null, fallback: string) => {
    if (!id) return fallback
    const scenario = scenarios.find(s => s.id === id)
    return scenario?.name ?? fallback
  }

  const leftName = getScenarioName(leftScenarioId, leftCompareState.title || 'Scenario A')
  const rightName = getScenarioName(rightScenarioId, rightCompareState.title || 'Scenario B')

  // Single calculator mode (no comparison)
  if (!isCompareMode) {
    return (
      <div className="space-y-4">
        <Calculator
          state={leftState}
          onChange={onLeftChange}
          showTitle={false}
        />
        <div className="flex justify-center" data-tour="compare-button">
          <button
            onClick={enterCompareMode}
            className="flex items-center gap-2 px-4 py-2 text-base font-medium text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Compare Scenarios
          </button>
        </div>
      </div>
    )
  }

  // Not enough scenarios to compare
  if (scenarios.length < 2) {
    return (
      <div className="space-y-4">
        <Calculator
          state={leftState}
          onChange={onLeftChange}
          showTitle={false}
        />
        <Card className="max-w-md mx-auto bg-muted/30">
          <CardContent className="py-6 text-center space-y-3">
            <ArrowLeftRight className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Create at least 2 scenarios to compare them
            </p>
            <p className="text-sm text-muted-foreground">
              Use the <span className="font-medium">+ New</span> button above to add another scenario
            </p>
            <button
              onClick={exitCompareMode}
              className="text-sm text-primary hover:underline"
            >
              Back to calculator
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Comparison mode
  return (
    <div className="space-y-6">
      {/* Scenario Selectors */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Select value={leftScenarioId ?? ''} onValueChange={setLeftScenarioId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((s) => (
              <SelectItem key={s.id} value={s.id} disabled={s.id === rightScenarioId}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground font-medium">vs</span>

        <Select value={rightScenarioId ?? ''} onValueChange={setRightScenarioId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((s) => (
              <SelectItem key={s.id} value={s.id} disabled={s.id === leftScenarioId}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comparison Grid */}
      {leftScenarioId && rightScenarioId && (
        <div className="space-y-3">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr,1fr] gap-4 text-center">
            <div className={`font-semibold text-lg py-2 rounded-lg ${winner === 'left' ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : ''}`}>
              {leftName}
            </div>
            <div className={`font-semibold text-lg py-2 rounded-lg ${winner === 'right' ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : ''}`}>
              {rightName}
            </div>
          </div>

          {/* Net Annual Row - Hero */}
          <ComparisonRow
            label="Take-home (Net)"
            leftValue={formatCurrency(leftCalc.netAnnual, leftCompareState.currency)}
            rightValue={formatCurrency(rightCalc.netAnnual, rightCompareState.currency)}
            leftRawValue={leftCalc.netAnnual}
            rightRawValue={rightCalc.netAnnual}
            leftBarWidth={getBarWidth(leftCalc.netAnnual, maxNet)}
            rightBarWidth={getBarWidth(rightCalc.netAnnual, maxNet)}
            winner={winner}
            percentDiff={netPercentChange}
            currency={leftCompareState.currency}
            isHero
          />

          {/* Gross Annual Row */}
          <ComparisonRow
            label="Gross Annual"
            leftValue={formatCurrency(leftCalc.grossAnnual, leftCompareState.currency)}
            rightValue={formatCurrency(rightCalc.grossAnnual, rightCompareState.currency)}
            leftRawValue={leftCalc.grossAnnual}
            rightRawValue={rightCalc.grossAnnual}
            leftBarWidth={getBarWidth(leftCalc.grossAnnual, maxGross)}
            rightBarWidth={getBarWidth(rightCalc.grossAnnual, maxGross)}
            winner={leftCalc.grossAnnual > rightCalc.grossAnnual ? 'left' : leftCalc.grossAnnual < rightCalc.grossAnnual ? 'right' : null}
            percentDiff={leftCalc.grossAnnual > 0 ? ((rightCalc.grossAnnual - leftCalc.grossAnnual) / leftCalc.grossAnnual) * 100 : 0}
            currency={leftCompareState.currency}
          />

          {/* Effective Hourly Row */}
          <ComparisonRow
            label="Effective Hourly"
            leftValue={`${formatCurrency(leftEffectiveHourly, leftCompareState.currency)}/hr`}
            rightValue={`${formatCurrency(rightEffectiveHourly, rightCompareState.currency)}/hr`}
            leftRawValue={leftEffectiveHourly}
            rightRawValue={rightEffectiveHourly}
            leftBarWidth={getBarWidth(leftEffectiveHourly, maxHourly)}
            rightBarWidth={getBarWidth(rightEffectiveHourly, maxHourly)}
            winner={effectiveHourlyWinner}
            percentDiff={leftEffectiveHourly > 0 ? ((rightEffectiveHourly - leftEffectiveHourly) / leftEffectiveHourly) * 100 : 0}
            currency={leftCompareState.currency}
          />

          {/* Hours/Year Row - inverted (less is better) */}
          <ComparisonRow
            label="Hours/Year"
            leftValue={leftCalc.billableHours.toLocaleString()}
            rightValue={rightCalc.billableHours.toLocaleString()}
            leftRawValue={leftCalc.billableHours}
            rightRawValue={rightCalc.billableHours}
            leftBarWidth={getBarWidth(leftCalc.billableHours, maxHours)}
            rightBarWidth={getBarWidth(rightCalc.billableHours, maxHours)}
            winner={leftCalc.billableHours < rightCalc.billableHours ? 'left' : leftCalc.billableHours > rightCalc.billableHours ? 'right' : null}
            percentDiff={hoursPercentChange}
            currency={leftCompareState.currency}
            invertColors
            isCurrency={false}
          />

          {/* Verdict Card */}
          <Card className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
            <CardContent className="py-5">
              <VerdictSummary
                winner={winner}
                leftName={leftName}
                rightName={rightName}
                netDifference={netDifference}
                hoursDifference={hoursDifference}
                leftEffectiveHourly={leftEffectiveHourly}
                rightEffectiveHourly={rightEffectiveHourly}
                currency={leftCompareState.currency}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-center">
        <button
          onClick={exitCompareMode}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to calculator
        </button>
      </div>
    </div>
  )
}

// Comparison Row Component
interface ComparisonRowProps {
  label: string
  leftValue: string
  rightValue: string
  leftRawValue: number
  rightRawValue: number
  leftBarWidth: number
  rightBarWidth: number
  winner: 'left' | 'right' | null
  percentDiff: number
  currency: Currency
  isHero?: boolean
  invertColors?: boolean
  isCurrency?: boolean
}

function ComparisonRow({
  label,
  leftValue,
  rightValue,
  leftRawValue,
  rightRawValue,
  leftBarWidth,
  rightBarWidth,
  winner,
  percentDiff,
  currency,
  isHero = false,
  invertColors = false,
  isCurrency = true,
}: ComparisonRowProps) {
  const valueClass = isHero ? 'text-2xl sm:text-3xl font-bold' : 'text-lg sm:text-xl font-semibold'
  const leftWins = winner === 'left'
  const rightWins = winner === 'right'

  // For inverted rows (like hours), positive diff is bad
  const diffIsGood = invertColors ? percentDiff < 0 : percentDiff > 0
  const diffBgColor = diffIsGood
    ? 'bg-emerald-500/15 border-emerald-500/30'
    : percentDiff === 0
      ? 'bg-muted/50 border-border'
      : 'bg-red-500/10 border-red-500/20'
  const diffTextColor = diffIsGood
    ? 'text-emerald-600 dark:text-emerald-400'
    : percentDiff === 0
      ? 'text-muted-foreground'
      : 'text-red-500'

  // Calculate absolute difference
  const absDiff = Math.abs(rightRawValue - leftRawValue)
  const formattedAbsDiff = isCurrency ? formatCurrency(absDiff, currency) : absDiff.toLocaleString()

  return (
    <motion.div
      className="py-4 border-b border-border/50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-sm text-muted-foreground text-center mb-3">{label}</p>
      <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
        {/* Left value */}
        <motion.div
          className={`text-center rounded-xl py-3 px-2 transition-all duration-200 ${
            leftWins
              ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border-l-4 border-emerald-500 shadow-lg shadow-emerald-500/10'
              : 'bg-muted/30'
          }`}
          animate={{ scale: leftWins ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <p className={`${valueClass} tabular-nums ${leftWins ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
            {leftValue}
          </p>
          {/* Mini bar */}
          <div className="mt-2 mx-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${leftWins ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-muted-foreground/30'}`}
              initial={{ width: 0 }}
              animate={{ width: `${leftBarWidth}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Delta Display - Center Column */}
        <div className="w-28 flex flex-col items-center gap-1">
          {/* Arrow indicator */}
          <div className="flex items-center justify-center h-6">
            {winner === 'left' && (
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-emerald-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.div>
            )}
            {winner === 'right' && (
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-emerald-500"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.div>
            )}
            {!winner && <Minus className="h-4 w-4 text-muted-foreground" />}
          </div>

          {/* Delta badge */}
          <motion.div
            className={`px-3 py-1.5 rounded-lg border ${diffBgColor}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <p className={`text-sm font-bold ${diffTextColor} tabular-nums`}>
              {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(1)}%
            </p>
            {absDiff > 0 && (
              <p className={`text-xs ${diffTextColor} tabular-nums opacity-75`}>
                {percentDiff >= 0 ? '+' : '-'}{formattedAbsDiff}
              </p>
            )}
          </motion.div>
        </div>

        {/* Right value */}
        <motion.div
          className={`text-center rounded-xl py-3 px-2 transition-all duration-200 ${
            rightWins
              ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border-l-4 border-emerald-500 shadow-lg shadow-emerald-500/10'
              : 'bg-muted/30'
          }`}
          animate={{ scale: rightWins ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <p className={`${valueClass} tabular-nums ${rightWins ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
            {rightValue}
          </p>
          {/* Mini bar */}
          <div className="mt-2 mx-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${rightWins ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-muted-foreground/30'}`}
              initial={{ width: 0 }}
              animate={{ width: `${rightBarWidth}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Verdict Summary Component
interface VerdictSummaryProps {
  winner: 'left' | 'right' | null
  leftName: string
  rightName: string
  netDifference: number
  hoursDifference: number
  leftEffectiveHourly: number
  rightEffectiveHourly: number
  currency: Currency
}

function VerdictSummary({
  winner,
  leftName,
  rightName,
  netDifference,
  hoursDifference,
  leftEffectiveHourly,
  rightEffectiveHourly,
  currency,
}: VerdictSummaryProps) {
  if (!winner) {
    return (
      <p className="text-lg text-center text-muted-foreground">
        Both scenarios have equal take-home pay
      </p>
    )
  }

  const winnerName = winner === 'right' ? rightName : leftName
  const absDiff = Math.abs(netDifference)
  const absHoursDiff = Math.abs(hoursDifference)

  // Determine if winner also works more or fewer hours
  const winnerWorksMore = (winner === 'right' && hoursDifference > 0) || (winner === 'left' && hoursDifference < 0)
  const winnerWorksFewer = (winner === 'right' && hoursDifference < 0) || (winner === 'left' && hoursDifference > 0)

  // Effective hourly comparison
  const winnerEffectiveHourly = winner === 'right' ? rightEffectiveHourly : leftEffectiveHourly
  const loserEffectiveHourly = winner === 'right' ? leftEffectiveHourly : rightEffectiveHourly
  const effectiveHourlyDiff = winnerEffectiveHourly - loserEffectiveHourly

  return (
    <div className="space-y-2 text-center">
      <p className="text-lg">
        <span className="font-bold text-emerald-600 dark:text-emerald-400">{winnerName}</span>
        {' pays '}
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(absDiff, currency)}
        </span>
        {' more per year'}
        {winnerWorksMore && absHoursDiff > 10 && (
          <span className="text-muted-foreground">
            {' but requires '}
            <span className="font-medium">{absHoursDiff.toLocaleString()}</span>
            {' more hours'}
          </span>
        )}
        {winnerWorksFewer && absHoursDiff > 10 && (
          <span className="text-muted-foreground">
            {' with '}
            <span className="font-medium">{absHoursDiff.toLocaleString()}</span>
            {' fewer hours'}
          </span>
        )}
      </p>

      {effectiveHourlyDiff !== 0 && (
        <p className="text-sm text-muted-foreground">
          Effective hourly: {formatCurrency(winnerEffectiveHourly, currency)}/hr vs {formatCurrency(loserEffectiveHourly, currency)}/hr
          <span className={effectiveHourlyDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
            {' '}({effectiveHourlyDiff > 0 ? '+' : ''}{formatCurrency(effectiveHourlyDiff, currency)}/hr)
          </span>
        </p>
      )}
    </div>
  )
}
