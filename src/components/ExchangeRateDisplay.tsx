import { useState, useEffect } from 'react'
import { ChevronDown, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import type { Currency, HistoricalRate } from '@/types'

const CURRENCIES: Currency[] = ['CAD', 'USD', 'EUR', 'GBP', 'MXN']

type TimeRange = '1M' | '3M' | '6M' | '1Y' | '5Y'

const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: '1M', label: '1M', days: 30 },
  { value: '3M', label: '3M', days: 90 },
  { value: '6M', label: '6M', days: 180 },
  { value: '1Y', label: '1Y', days: 365 },
  { value: '5Y', label: '5Y', days: 365 * 5 },
]

interface SparklineProps {
  data: HistoricalRate[]
  width?: number
  height?: number
}

function Sparkline({ data, width = 200, height = 40 }: SparklineProps) {
  if (data.length < 2) return null

  const rates = data.map(d => d.rate)
  const min = Math.min(...rates)
  const max = Math.max(...rates)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.rate - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const firstRate = rates[0]
  const lastRate = rates[rates.length - 1]
  const trend = lastRate > firstRate ? 'up' : lastRate < firstRate ? 'down' : 'flat'
  const strokeColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#6b7280'

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        points={points}
      />
      {/* End dot */}
      <circle
        cx={width}
        cy={height - ((lastRate - min) / range) * (height - 4) - 2}
        r="2"
        fill={strokeColor}
      />
    </svg>
  )
}

interface ExchangeRateDisplayProps {
  baseCurrency: Currency
}

export function ExchangeRateDisplay({ baseCurrency }: ExchangeRateDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPair, setSelectedPair] = useState<Currency>(
    baseCurrency === 'USD' ? 'CAD' : 'USD'
  )
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')
  const { exchangeRates, historicalData, fetchHistorical, getRate, getAgeString, loading, fetchRates } = useExchangeRate()

  const selectedDays = TIME_RANGES.find(t => t.value === timeRange)?.days ?? 365

  // Fetch historical data when pair or time range changes
  useEffect(() => {
    if (isOpen && baseCurrency && selectedPair) {
      fetchHistorical(baseCurrency, selectedPair, selectedDays)
    }
  }, [isOpen, baseCurrency, selectedPair, selectedDays, fetchHistorical])

  if (!exchangeRates) return null

  const rate = getRate(baseCurrency, selectedPair)
  const historyKey = `${baseCurrency}-${selectedPair}-${selectedDays}`
  const history = historicalData[historyKey] || []

  // Calculate change from start of selected period
  const startRate = history.length > 0 ? history[0].rate : rate
  const changePercent = ((rate - startRate) / startRate) * 100
  const TrendIcon = changePercent > 0.5 ? TrendingUp : changePercent < -0.5 ? TrendingDown : Minus
  const trendColor = changePercent > 0.5 ? 'text-green-600' : changePercent < -0.5 ? 'text-red-600' : 'text-muted-foreground'

  const otherCurrencies = CURRENCIES.filter(c => c !== baseCurrency)

  const timeRangeLabel = TIME_RANGES.find(t => t.value === timeRange)?.label ?? '1Y'

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/10 hover:bg-muted/30 transition-colors text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">1 {baseCurrency} =</span>
          <span className="font-medium">{rate.toFixed(4)} {selectedPair}</span>
          <TrendIcon className={`h-3 w-3 ${trendColor}`} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getAgeString()}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4 px-2 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Compare to:</span>
          <Select value={selectedPair} onValueChange={(v) => setSelectedPair(v as Currency)}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {otherCurrencies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchRates(true)}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Time range badges */}
        <div className="flex items-center gap-1">
          {TIME_RANGES.map((range) => (
            <Badge
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              className="cursor-pointer text-xs px-2 py-0.5"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Badge>
          ))}
        </div>

        {/* Rate display */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">1 {baseCurrency} = {rate.toFixed(4)} {selectedPair}</p>
              <p className={`text-sm ${trendColor} flex items-center gap-1`}>
                <TrendIcon className="h-3 w-3" />
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}% vs {timeRangeLabel} ago
              </p>
            </div>
            {history.length > 0 && (
              <Sparkline data={history} />
            )}
          </div>
        </div>

        {/* Other rates quick view */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          {otherCurrencies.filter(c => c !== selectedPair).map((currency) => (
            <div key={currency} className="bg-muted/20 rounded p-2 text-center">
              <p className="text-muted-foreground text-xs">{currency}</p>
              <p className="font-medium">{getRate(baseCurrency, currency).toFixed(4)}</p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
