import { useState, useCallback } from 'react'
import { ChevronRight, Calendar, Receipt, Pencil, Check, ArrowRightLeft, HelpCircle, Share2 } from 'lucide-react'
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
  { value: 'MXN', label: 'MXN', symbol: '$' },
]

const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: '🇺🇸',
  CAD: '🇨🇦',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  MXN: '🇲🇽',
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
                  className="font-medium h-10 text-base"
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
            <Label htmlFor="mainInput" className="text-sm text-muted-foreground">
              {state.calculationMode === 'hourlyToSalary' ? 'Hourly Rate' : 'Target Salary'}
            </Label>
            <button
              onClick={() => updateState({
                calculationMode: state.calculationMode === 'hourlyToSalary' ? 'salaryToHourly' : 'hourlyToSalary'
              })}
              className="text-sm text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded border border-transparent hover:border-border transition-colors"
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
          <SelectTrigger className="w-24 h-11" aria-label="Select currency">
            <SelectValue>
              {CURRENCY_FLAGS[state.currency]} {state.currency}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{CURRENCY_FLAGS[c.value]} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>

        {/* Settings Sections */}
        <div className="flex justify-end mb-1">
          <button
            onClick={toggleAllSections}
            className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors"
          >
            {allExpanded || openSection === 'all' ? 'Collapse all' : 'Expand all settings'}
          </button>
        </div>
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm overflow-hidden">
          {/* Currency Settings */}
          <Collapsible open={openSection === 'currency' || openSection === 'all'} onOpenChange={() => toggleSection('currency')}>
            <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-all text-base ${openSection === 'currency' || openSection === 'all' ? 'border-l-2 border-l-emerald-500' : 'border-l-2 border-l-transparent'}`}>
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${openSection === 'currency' || openSection === 'all' ? 'rotate-90' : ''}`} />
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

          {/* Work Schedule - Consolidated */}
          <Collapsible open={openSection === 'schedule' || openSection === 'all'} onOpenChange={() => toggleSection('schedule')}>
            <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-all text-base ${openSection === 'schedule' || openSection === 'all' ? 'border-l-2 border-l-emerald-500' : 'border-l-2 border-l-transparent'}`}>
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${openSection === 'schedule' || openSection === 'all' ? 'rotate-90' : ''}`} />
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Work Schedule</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentCountry?.flag} {state.region} · {state.holidaysPerYear + (state.unlimitedPTO ? 0 : state.ptoDays + state.sickDays)} days off
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-4">
              {/* Location Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Country</Label>
                  <Select value={state.country} onValueChange={handleCountryChange}>
                    <SelectTrigger className="h-10 text-base">
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
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Region</Label>
                  <Select value={state.region} onValueChange={handleRegionChange}>
                    <SelectTrigger className="h-10 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCountry?.regions.map((r) => (
                        <SelectItem key={r.code} value={r.code}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Off Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Holidays</Label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={state.holidaysPerYear || ''}
                    onChange={(e) => updateState({ holidaysPerYear: parseInt(e.target.value) || 0 })}
                    className="h-10 text-base"
                  />
                  <span className="text-xs text-muted-foreground">public</span>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">PTO</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={state.ptoDays || ''}
                    onChange={(e) => updateState({ ptoDays: parseInt(e.target.value) || 0 })}
                    className="h-10 text-base"
                    disabled={state.unlimitedPTO}
                  />
                  <span className="text-xs text-muted-foreground">vacation</span>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Sick Days</Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={state.sickDays || ''}
                    onChange={(e) => updateState({ sickDays: parseInt(e.target.value) || 0 })}
                    className="h-10 text-base"
                    disabled={state.unlimitedPTO}
                  />
                  <span className="text-xs text-muted-foreground">personal</span>
                </div>
              </div>

              {/* Paid PTO Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="unlimitedPTO" className="text-base">Employer provides paid time off</Label>
                <Switch
                  id="unlimitedPTO"
                  checked={state.unlimitedPTO}
                  onCheckedChange={(checked) => updateState({ unlimitedPTO: checked })}
                />
              </div>

              {/* Hours Per Week */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Hours/Day</Label>
                  <Input
                    type="number"
                    min={1}
                    max={16}
                    value={state.hoursPerDay || ''}
                    onChange={(e) => updateState({ hoursPerDay: parseInt(e.target.value) || 8 })}
                    className="h-10 text-base"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Days/Week</Label>
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={state.daysPerWeek || ''}
                    onChange={(e) => updateState({ daysPerWeek: parseInt(e.target.value) || 5 })}
                    className="h-10 text-base"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="pt-2 border-t text-base text-muted-foreground">
                {calculation.billableHours.toLocaleString()} billable hours/year
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Tax Estimate */}
          <Collapsible open={openSection === 'tax' || openSection === 'all'} onOpenChange={() => toggleSection('tax')}>
            <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-all text-base ${openSection === 'tax' || openSection === 'all' ? 'border-l-2 border-l-emerald-500' : 'border-l-2 border-l-transparent'}`}>
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${openSection === 'tax' || openSection === 'all' ? 'rotate-90' : ''}`} />
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span>Taxes</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {state.showTaxEstimate ? formatPercent(calculation.taxBreakdown.effectiveRate) : 'Off'}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showTax" className="text-base">Show tax estimate</Label>
                <Switch
                  id="showTax"
                  checked={state.showTaxEstimate}
                  onCheckedChange={(checked) => updateState({ showTaxEstimate: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="selfEmployed" className="text-base">Self-employed</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
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
                <div className="space-y-1 text-base pt-1 border-t">
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
        <Card className="relative overflow-hidden border-0 shadow-xl shadow-black/5 hover:shadow-2xl transition-shadow duration-300">
        {/* Gradient accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardContent className="p-0 pt-1">
          <div className={`grid ${state.showCurrencyConversion && state.currency !== displayCurrency ? 'grid-cols-1 sm:grid-cols-2 sm:divide-x' : 'grid-cols-1'} divide-y sm:divide-y-0`}>
            {/* Main Currency Column */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {CURRENCY_FLAGS[state.currency]} {state.currency}
                </span>
                <Badge variant="outline" className="text-sm px-1.5 py-0 h-5 hidden sm:inline-flex">Primary</Badge>
              </div>

              {state.calculationMode === 'hourlyToSalary' ? (
                <div className="space-y-1">
                  {state.showTaxEstimate ? (
                    <>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Take-home</p>
                      <p className="text-5xl font-bold tracking-tight leading-none text-green-600 dark:text-green-400 tabular-nums">
                        <AnimatedNumber
                          value={calculation.netAnnual}
                          formatter={(n) => formatCurrency(n, state.currency, { showCode: false })}
                        />
                      </p>
                      <p className="text-lg text-muted-foreground tabular-nums">
                        {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })} gross
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual</p>
                      <p className="text-5xl font-bold tracking-tight leading-none tabular-nums">
                        <AnimatedNumber
                          value={calculation.grossAnnual}
                          formatter={(n) => formatCurrency(n, state.currency, { showCode: false })}
                        />
                      </p>
                    </>
                  )}
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatCurrency(state.hourlyRate, state.currency, { showCode: false })}/hr × {calculation.billableHours.toLocaleString()} hrs
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Hourly Rate</p>
                  <p className="text-5xl font-bold tracking-tight leading-none tabular-nums">
                    {formatCurrency(calculation.calculatedHourlyRate, state.currency, { showCode: false })}/hr
                  </p>
                  <p className="text-lg text-muted-foreground tabular-nums">
                    {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })}
                    <span className="text-sm ml-1">gross</span>
                  </p>
                  {state.showTaxEstimate && (
                    <p className="text-base text-green-600 dark:text-green-400 tabular-nums">
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
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {CURRENCY_FLAGS[displayCurrency]} {displayCurrency}
                    </span>
                    {state.traderMargin > 0 && (
                      <Badge variant="secondary" className="text-sm px-1 py-0 h-5">
                        -{state.traderMargin}%
                      </Badge>
                    )}
                  </div>
                  <Select
                    value={displayCurrency}
                    onValueChange={(v) => updateState({ displayCurrency: v as Currency })}
                  >
                    <SelectTrigger className="w-24 h-9 text-base px-2" aria-label="Select display currency">
                      <SelectValue>
                        {CURRENCY_FLAGS[displayCurrency]} {displayCurrency}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.filter(c => c.value !== state.currency).map((c) => (
                        <SelectItem key={c.value} value={c.value}>{CURRENCY_FLAGS[c.value]} {c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {state.calculationMode === 'hourlyToSalary' ? (
                  <div className="space-y-1">
                    {state.showTaxEstimate ? (
                      <>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Take-home</p>
                        <p className="text-4xl font-bold tracking-tight leading-none text-green-600/80 dark:text-green-400/80 tabular-nums">
                          {formatCurrency(convertedNet, displayCurrency, { showCode: false })}
                        </p>
                        <p className="text-base text-muted-foreground tabular-nums">
                          {formatCurrency(convertedGross, displayCurrency, { showCode: false })} gross
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual</p>
                        <p className="text-4xl font-bold tracking-tight leading-none text-muted-foreground tabular-nums">
                          {formatCurrency(convertedGross, displayCurrency, { showCode: false })}
                        </p>
                      </>
                    )}
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatCurrency(convertWithMargin(state.hourlyRate, state.currency, displayCurrency, state.traderMargin), displayCurrency, { showCode: false })}/hr × {calculation.billableHours.toLocaleString()} hrs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Hourly Rate</p>
                    <p className="text-4xl font-bold tracking-tight leading-none text-muted-foreground tabular-nums">
                      {formatCurrency(convertedHourly, displayCurrency, { showCode: false })}/hr
                    </p>
                    <p className="text-base text-muted-foreground tabular-nums">
                      {formatCurrency(convertedGross, displayCurrency, { showCode: false })}
                      <span className="text-sm ml-1">gross</span>
                    </p>
                    {state.showTaxEstimate && (
                      <p className="text-base text-green-600/80 dark:text-green-400/80 tabular-nums">
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
            <div className="px-4 py-2 border-t bg-muted/5 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4" />
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
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          {copied ? 'Copied!' : 'Share calculation'}
        </button>
      </div>

      {/* Exchange Rate Display */}
        <ExchangeRateDisplay baseCurrency={state.currency} />
      </div>
    </div>
  )
}
