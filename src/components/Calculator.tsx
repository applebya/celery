import { useState, useCallback } from 'react'
import { ChevronRight, MapPin, Calendar, Clock, Receipt, Pencil, Check, ArrowRightLeft, HelpCircle, Share2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AnimatedNumber } from './AnimatedNumber'
import { ExchangeRateDisplay } from './ExchangeRateDisplay'
import { countries, getCountry, getHolidayCount } from '@/data/holidays-2026'
import { useCalculation } from '@/hooks/useCalculation'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { useUrlState } from '@/hooks/useUrlState'
import { formatCurrency, formatPercent } from '@/lib/calculate'
import type { CalculatorState, Currency } from '@/types'

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'CAD', label: 'CAD', symbol: 'C$' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
]

const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: '🇺🇸',
  CAD: '🇨🇦',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
}

const MARGIN_PRESETS = [
  { label: 'Wise', value: 0.5 },
  { label: 'Bank', value: 2.5 },
  { label: 'PayPal', value: 3.5 },
] as const

interface CalculatorProps {
  state: CalculatorState
  onChange: (state: CalculatorState) => void
  showTitle?: boolean
}

export function Calculator({ state, onChange, showTitle = false }: CalculatorProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [allExpanded, setAllExpanded] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(state.title)

  const calculation = useCalculation(state)
  const { convertWithMargin, exchangeRates, getRate, error } = useExchangeRate()
  const { getShareUrl } = useUrlState(state, onChange)

  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silently fail - clipboard API not available
    }
  }

  const updateState = useCallback(
    (updates: Partial<CalculatorState>) => {
      onChange({ ...state, ...updates })
    },
    [state, onChange]
  )

  const handleCountryChange = useCallback(
    (country: 'CA' | 'US') => {
      const countryData = getCountry(country)
      const defaultRegion = country === 'CA' ? 'ON' : 'CA'
      const holidays = getHolidayCount(country, defaultRegion)
      updateState({
        country,
        region: defaultRegion,
        currency: countryData?.currency ?? 'CAD',
        holidaysPerYear: holidays,
      })
    },
    [updateState]
  )

  const handleRegionChange = useCallback(
    (region: string) => {
      const holidays = getHolidayCount(state.country, region)
      updateState({ region, holidaysPerYear: holidays })
    },
    [state.country, updateState]
  )

  const toggleSection = (section: string) => {
    if (openSection === 'all') {
      // When all expanded, clicking one collapses to just that one
      setOpenSection(section)
      setAllExpanded(false)
    } else {
      setOpenSection(openSection === section ? null : section)
    }
  }

  const toggleAllSections = () => {
    if (allExpanded) {
      setOpenSection(null)
    } else {
      setOpenSection('all')
    }
    setAllExpanded(!allExpanded)
  }

  const handleTitleSave = () => {
    updateState({ title: titleInput })
    setEditingTitle(false)
  }

  const currentCountry = getCountry(state.country)

  // Auto-select display currency if same as main
  const displayCurrency = state.displayCurrency === state.currency
    ? (state.currency === 'USD' ? 'CAD' : 'USD')
    : state.displayCurrency

  // Calculate converted amounts with margin
  const convertedGross = convertWithMargin(calculation.grossAnnual, state.currency, displayCurrency, state.traderMargin)
  const convertedNet = convertWithMargin(calculation.netAnnual, state.currency, displayCurrency, state.traderMargin)
  const convertedHourly = convertWithMargin(calculation.calculatedHourlyRate, state.currency, displayCurrency, state.traderMargin)

  const effectiveRate = getRate(state.currency, displayCurrency)
  const rateWithMargin = effectiveRate * (1 - state.traderMargin / 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr,1.2fr] gap-4 md:gap-6">
      {/* Left Panel - Inputs */}
      <div className="space-y-3">
        {showTitle && (
          <div className="flex items-center gap-2">
            {editingTitle ? (
              <>
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Scenario name"
                  className="font-medium h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                />
                <button
                  onClick={handleTitleSave}
                  className="p-2 hover:bg-muted rounded-md"
                  aria-label="Save title"
                >
                  <Check className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <h2 className="font-medium">
                  {state.title || 'Untitled'}
                </h2>
                <button
                  onClick={() => {
                    setTitleInput(state.title)
                    setEditingTitle(true)
                  }}
                  className="p-2 hover:bg-muted rounded-md opacity-50 hover:opacity-100"
                  aria-label="Edit title"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Input with Mode Toggle */}
        <div className="flex gap-2 items-end">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Label htmlFor="mainInput" className="text-xs text-muted-foreground">
              {state.calculationMode === 'hourlyToSalary' ? 'Hourly Rate' : 'Target Salary'}
            </Label>
            <button
              onClick={() => updateState({
                calculationMode: state.calculationMode === 'hourlyToSalary' ? 'salaryToHourly' : 'hourlyToSalary'
              })}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded border border-transparent hover:border-border transition-colors"
            >
              Switch to {state.calculationMode === 'hourlyToSalary' ? 'salary' : 'rate'}
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
              $
            </span>
            <Input
              id="mainInput"
              type="number"
              min={0}
              value={state.calculationMode === 'hourlyToSalary' ? (state.hourlyRate || '') : (state.targetSalary || '')}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0
                updateState(state.calculationMode === 'hourlyToSalary' ? { hourlyRate: val } : { targetSalary: val })
              }}
              className="pl-8 text-xl font-semibold h-11"
            />
          </div>
        </div>
        <Select value={state.currency} onValueChange={(v) => updateState({ currency: v as Currency })}>
          <SelectTrigger className="w-20 h-11" aria-label="Select currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>

        {/* Settings Sections */}
        <div className="flex justify-end mb-1">
          <button
            onClick={toggleAllSections}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors"
          >
            {allExpanded || openSection === 'all' ? 'Collapse all' : 'Expand all settings'}
          </button>
        </div>
        <div className="space-y-px rounded-lg border bg-card/50 overflow-hidden">
          {/* Currency Settings */}
          <Collapsible open={openSection === 'currency' || openSection === 'all'} onOpenChange={() => toggleSection('currency')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-base">
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-4 w-4 transition-transform ${openSection === 'currency' || openSection === 'all' ? 'rotate-90' : ''}`} />
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                <span>Currency Settings</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {state.showCurrencyConversion
                  ? `${CURRENCY_FLAGS[displayCurrency]} ${displayCurrency} · ${state.traderMargin}%`
                  : 'Disabled'}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-3">
              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="showConversion" className="text-base">Show currency conversion</Label>
                <Switch
                  id="showConversion"
                  checked={state.showCurrencyConversion}
                  onCheckedChange={(checked) => updateState({ showCurrencyConversion: checked })}
                />
              </div>

              {state.showCurrencyConversion && (
                <>
                  {/* Display Currency Selector */}
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Display Currency</Label>
                    <Select
                      value={displayCurrency}
                      onValueChange={(v) => updateState({ displayCurrency: v as Currency })}
                    >
                      <SelectTrigger className="h-10 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.filter(c => c.value !== state.currency).map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {CURRENCY_FLAGS[c.value]} {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conversion Margin */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Conversion Margin</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Fee cushion for payment processing, currency conversion, or client payment delays. Contractors typically add 2-5%.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Preset Chips */}
                    <div className="flex flex-wrap gap-2">
                      {MARGIN_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => updateState({ traderMargin: preset.value })}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                            state.traderMargin === preset.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/50 hover:bg-muted border-transparent'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          !MARGIN_PRESETS.some(p => p.value === state.traderMargin)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 hover:bg-muted border-transparent'
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {/* Slider */}
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[state.traderMargin]}
                        onValueChange={([value]) => updateState({ traderMargin: value })}
                        max={10}
                        step={0.5}
                        className="flex-1"
                      />
                      <span className="text-base font-medium tabular-nums w-12 text-right">{state.traderMargin}%</span>
                    </div>
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Location & Holidays */}
          <Collapsible open={openSection === 'location' || openSection === 'all'} onOpenChange={() => toggleSection('location')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm border-t">
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${openSection === 'location' || openSection === 'all' ? 'rotate-90' : ''}`} />
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Location</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {currentCountry?.flag} {state.region} · {state.holidaysPerYear} holidays
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Select value={state.country} onValueChange={handleCountryChange}>
                  <SelectTrigger className="h-8 text-xs" aria-label="Select country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={state.region} onValueChange={handleRegionChange}>
                  <SelectTrigger className="h-8 text-xs" aria-label="Select region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCountry?.regions.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.name} ({r.holidays})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={state.holidaysPerYear || ''}
                  onChange={(e) => updateState({ holidaysPerYear: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs"
                  placeholder="Holidays"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Time Off */}
          <Collapsible open={openSection === 'timeoff' || openSection === 'all'} onOpenChange={() => toggleSection('timeoff')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm border-t">
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${openSection === 'timeoff' || openSection === 'all' ? 'rotate-90' : ''}`} />
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Time Off</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {state.unlimitedPTO ? 'Paid PTO' : `${state.ptoDays + state.sickDays} days unpaid`}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="unlimitedPTO" className="text-xs">Employer provides paid time off</Label>
                <Switch
                  id="unlimitedPTO"
                  checked={state.unlimitedPTO}
                  onCheckedChange={(checked) => updateState({ unlimitedPTO: checked })}
                />
              </div>
              {!state.unlimitedPTO && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">PTO Days</Label>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={state.ptoDays || ''}
                      onChange={(e) => updateState({ ptoDays: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Sick Days</Label>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={state.sickDays || ''}
                      onChange={(e) => updateState({ sickDays: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Work Schedule */}
          <Collapsible open={openSection === 'schedule' || openSection === 'all'} onOpenChange={() => toggleSection('schedule')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm border-t">
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${openSection === 'schedule' || openSection === 'all' ? 'rotate-90' : ''}`} />
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Schedule</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {state.hoursPerDay}h × {state.daysPerWeek}d = {state.hoursPerDay * state.daysPerWeek}h/wk
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Hours/Day</Label>
                  <Input
                    type="number"
                    min={1}
                    max={16}
                    value={state.hoursPerDay || ''}
                    onChange={(e) => updateState({ hoursPerDay: parseInt(e.target.value) || 8 })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Days/Week</Label>
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={state.daysPerWeek || ''}
                    onChange={(e) => updateState({ daysPerWeek: parseInt(e.target.value) || 5 })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Tax Estimate */}
          <Collapsible open={openSection === 'tax' || openSection === 'all'} onOpenChange={() => toggleSection('tax')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm border-t">
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${openSection === 'tax' || openSection === 'all' ? 'rotate-90' : ''}`} />
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Taxes</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {state.showTaxEstimate ? formatPercent(calculation.taxBreakdown.effectiveRate) : 'Off'}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showTax" className="text-xs">Show tax estimate</Label>
                <Switch
                  id="showTax"
                  checked={state.showTaxEstimate}
                  onCheckedChange={(checked) => updateState({ showTaxEstimate: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="selfEmployed" className="text-xs">Self-employed</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Includes self-employment tax (~15.3% in US, CPP in Canada). Turn off if you're a W-2/T4 employee.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Switch
                  id="selfEmployed"
                  checked={state.isSelfEmployed}
                  onCheckedChange={(checked) => updateState({ isSelfEmployed: checked })}
                />
              </div>
              {state.showTaxEstimate && (
                <div className="space-y-1 text-xs pt-1 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Federal</span>
                    <span>{formatCurrency(calculation.taxBreakdown.federal, state.currency, { showCode: false })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {state.country === 'CA' ? 'Provincial' : 'State'}
                    </span>
                    <span>{formatCurrency(calculation.taxBreakdown.provincialState, state.currency, { showCode: false })}</span>
                  </div>
                  {state.isSelfEmployed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {state.country === 'CA' ? 'CPP' : 'Self-Emp'}
                      </span>
                      <span>{formatCurrency(calculation.taxBreakdown.selfEmployment, state.currency, { showCode: false })}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(calculation.taxBreakdown.total, state.currency, { showCode: false })}</span>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="md:sticky md:top-4 md:self-start space-y-3">
        {/* Results - 2 Column Layout */}
        <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="p-0">
          <div className={`grid ${state.showCurrencyConversion && state.currency !== displayCurrency ? 'grid-cols-1 sm:grid-cols-2 sm:divide-x' : 'grid-cols-1'} divide-y sm:divide-y-0`}>
            {/* Main Currency Column */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {state.currency}
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 hidden sm:inline-flex">Primary</Badge>
              </div>

              {state.calculationMode === 'hourlyToSalary' ? (
                <div className="space-y-1">
                  {state.showTaxEstimate ? (
                    <>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Take-home</p>
                      <p className="text-2xl font-bold tracking-tight leading-none text-green-600 dark:text-green-400">
                        <AnimatedNumber
                          value={calculation.netAnnual}
                          formatter={(n) => formatCurrency(n, state.currency, { showCode: false })}
                        />
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })} gross
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual</p>
                      <p className="text-2xl font-bold tracking-tight leading-none">
                        <AnimatedNumber
                          value={calculation.grossAnnual}
                          formatter={(n) => formatCurrency(n, state.currency, { showCode: false })}
                        />
                      </p>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(state.hourlyRate, state.currency, { showCode: false })}/hr × {calculation.billableHours.toLocaleString()} hrs
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight leading-none">
                    {formatCurrency(calculation.calculatedHourlyRate, state.currency, { showCode: false })}/hr
                  </p>
                  <p className="text-base font-medium">
                    {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })}
                    <span className="text-xs text-muted-foreground ml-1">gross</span>
                  </p>
                  {state.showTaxEstimate && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(calculation.netAnnual, state.currency, { showCode: false })} net
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Display Currency Column - only show if enabled */}
            {state.showCurrencyConversion && state.currency !== displayCurrency && (
              <div className="p-4 space-y-2 bg-muted/10">
                <span className="sr-only">Results in {displayCurrency}</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide sm:text-[10px]">
                      Also in {displayCurrency}
                    </span>
                    {state.traderMargin > 0 && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        -{state.traderMargin}%
                      </Badge>
                    )}
                  </div>
                  <Select
                    value={displayCurrency}
                    onValueChange={(v) => updateState({ displayCurrency: v as Currency })}
                  >
                    <SelectTrigger className="w-20 h-9 text-xs px-2" aria-label="Select display currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.filter(c => c.value !== state.currency).map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {state.calculationMode === 'hourlyToSalary' ? (
                  <div className="space-y-1">
                    {state.showTaxEstimate ? (
                      <>
                        <p className="text-xs text-muted-foreground/60 uppercase tracking-wide">Take-home</p>
                        <p className="text-2xl font-bold tracking-tight leading-none text-green-600/60 dark:text-green-400/60">
                          {formatCurrency(convertedNet, displayCurrency, { showCode: false })}
                        </p>
                        <p className="text-sm text-muted-foreground/60">
                          {formatCurrency(convertedGross, displayCurrency, { showCode: false })} gross
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground/60 uppercase tracking-wide">Annual</p>
                        <p className="text-2xl font-bold tracking-tight leading-none text-muted-foreground/80">
                          {formatCurrency(convertedGross, displayCurrency, { showCode: false })}
                        </p>
                      </>
                    )}
                    <p className="text-xs text-muted-foreground/60">
                      {formatCurrency(convertWithMargin(state.hourlyRate, state.currency, displayCurrency, state.traderMargin), displayCurrency, { showCode: false })}/hr × {calculation.billableHours.toLocaleString()} hrs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-2xl font-bold tracking-tight leading-none text-muted-foreground/80">
                      {formatCurrency(convertedHourly, displayCurrency, { showCode: false })}/hr
                    </p>
                    <p className="text-base font-medium text-muted-foreground/70">
                      {formatCurrency(convertedGross, displayCurrency, { showCode: false })}
                      <span className="text-xs text-muted-foreground/60 ml-1">gross</span>
                    </p>
                    {state.showTaxEstimate && (
                      <p className="text-sm text-green-600/60 dark:text-green-400/60">
                        {formatCurrency(convertedNet, displayCurrency, { showCode: false })} net
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Exchange Rate Footer */}
          {exchangeRates && (
            <div className="px-4 py-2 border-t bg-muted/5 flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ArrowRightLeft className="h-3 w-3" />
                <span>
                  1 {state.currency} = {rateWithMargin.toFixed(4)} {displayCurrency}
                  {state.traderMargin > 0 && (
                    <span className="opacity-60"> ({state.traderMargin}% margin)</span>
                  )}
                </span>
                {error && (
                  <span className="text-amber-500" title="Using offline fallback rates">
                    (offline)
                  </span>
                )}
              </div>
              <span>{calculation.billableHours.toLocaleString()} hrs/yr</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          {copied ? 'Copied!' : 'Share calculation'}
        </button>
      </div>

      {/* Exchange Rate Display */}
        <ExchangeRateDisplay baseCurrency={state.currency} />
      </div>
    </div>
  )
}
