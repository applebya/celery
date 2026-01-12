import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, MapPin, Calendar, Clock, Receipt, Pencil, Check, ArrowRightLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ExchangeRateDisplay } from './ExchangeRateDisplay'
import { countries, getCountry, getHolidayCount } from '@/data/holidays-2026'
import { useCalculation } from '@/hooks/useCalculation'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { formatCurrency, formatPercent } from '@/lib/calculate'
import type { CalculatorState, Currency } from '@/types'

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'CAD', label: 'CAD', symbol: 'C$' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
]

interface CalculatorProps {
  state: CalculatorState
  onChange: (state: CalculatorState) => void
  showTitle?: boolean
}

export function Calculator({ state, onChange, showTitle = false }: CalculatorProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(state.title)

  const calculation = useCalculation(state)
  const { convertWithMargin, exchangeRates, getRate } = useExchangeRate()

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
    setOpenSection(openSection === section ? null : section)
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
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center gap-2">
          {editingTitle ? (
            <>
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Scenario name"
                className="text-lg font-medium h-9"
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
              <h2 className="text-lg font-medium">
                {state.title || 'Untitled'}
              </h2>
              <button
                onClick={() => {
                  setTitleInput(state.title)
                  setEditingTitle(true)
                }}
                className="p-1 hover:bg-muted rounded-md"
                aria-label="Edit title"
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-lg border p-1 bg-muted/30">
          <Button
            variant={state.calculationMode === 'hourlyToSalary' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => updateState({ calculationMode: 'hourlyToSalary' })}
            className="text-xs rounded-md"
          >
            Rate to Salary
          </Button>
          <Button
            variant={state.calculationMode === 'salaryToHourly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => updateState({ calculationMode: 'salaryToHourly' })}
            className="text-xs rounded-md"
          >
            Salary to Rate
          </Button>
        </div>
      </div>

      {/* Input Section */}
      {state.calculationMode === 'hourlyToSalary' ? (
        <div className="space-y-2">
          <Label htmlFor="hourlyRate" className="text-muted-foreground text-sm">Hourly Rate</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="hourlyRate"
                type="number"
                min={0}
                value={state.hourlyRate || ''}
                onChange={(e) => updateState({ hourlyRate: parseFloat(e.target.value) || 0 })}
                className="pl-7 text-2xl font-semibold h-12"
              />
            </div>
            <Select value={state.currency} onValueChange={(v) => updateState({ currency: v as Currency })}>
              <SelectTrigger className="w-24 h-12" aria-label="Select currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="targetSalary" className="text-muted-foreground text-sm">Target Annual Salary</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="targetSalary"
                type="number"
                min={0}
                value={state.targetSalary || ''}
                onChange={(e) => updateState({ targetSalary: parseFloat(e.target.value) || 0 })}
                className="pl-7 text-2xl font-semibold h-12"
              />
            </div>
            <Select value={state.currency} onValueChange={(v) => updateState({ currency: v as Currency })}>
              <SelectTrigger className="w-24 h-12" aria-label="Select currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results - 2 Column Layout */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x">
            {/* Main Currency Column */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {state.currency}
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">Primary</Badge>
              </div>

              <div className="space-y-3">
                {state.calculationMode === 'hourlyToSalary' ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Annual Gross</p>
                      <p className="text-2xl font-bold tracking-tight">
                        {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })}
                      </p>
                    </div>
                    {state.showTaxEstimate && (
                      <div>
                        <p className="text-xs text-muted-foreground">After Tax</p>
                        <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(calculation.netAnnual, state.currency, { showCode: false })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercent(calculation.taxBreakdown.effectiveRate)} effective rate
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                      <p className="text-lg font-medium">
                        {formatCurrency(state.hourlyRate, state.currency, { showCode: false })}/hr
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Required Hourly Rate</p>
                      <p className="text-2xl font-bold tracking-tight">
                        {formatCurrency(calculation.calculatedHourlyRate, state.currency, { showCode: false })}/hr
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Annual Gross</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })}
                      </p>
                    </div>
                    {state.showTaxEstimate && (
                      <div>
                        <p className="text-xs text-muted-foreground">After Tax</p>
                        <p className="text-lg font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(calculation.netAnnual, state.currency, { showCode: false })}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Display Currency Column */}
            <div className="p-6 space-y-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {displayCurrency}
                  </span>
                  {state.traderMargin > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      -{state.traderMargin}% margin
                    </Badge>
                  )}
                </div>
                <Select
                  value={displayCurrency}
                  onValueChange={(v) => updateState({ displayCurrency: v as Currency })}
                >
                  <SelectTrigger className="w-20 h-7 text-xs" aria-label="Select display currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.filter(c => c.value !== state.currency).map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {state.calculationMode === 'hourlyToSalary' ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Annual Gross</p>
                      <p className="text-2xl font-bold tracking-tight text-muted-foreground">
                        {formatCurrency(convertedGross, displayCurrency, { showCode: false })}
                      </p>
                    </div>
                    {state.showTaxEstimate && (
                      <div>
                        <p className="text-xs text-muted-foreground">After Tax</p>
                        <p className="text-xl font-semibold text-green-600/70 dark:text-green-400/70">
                          {formatCurrency(convertedNet, displayCurrency, { showCode: false })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                      <p className="text-lg font-medium text-muted-foreground">
                        {formatCurrency(convertWithMargin(state.hourlyRate, state.currency, displayCurrency, state.traderMargin), displayCurrency, { showCode: false })}/hr
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Required Hourly Rate</p>
                      <p className="text-2xl font-bold tracking-tight text-muted-foreground">
                        {formatCurrency(convertedHourly, displayCurrency, { showCode: false })}/hr
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Annual Gross</p>
                      <p className="text-xl font-semibold text-muted-foreground">
                        {formatCurrency(convertedGross, displayCurrency, { showCode: false })}
                      </p>
                    </div>
                    {state.showTaxEstimate && (
                      <div>
                        <p className="text-xs text-muted-foreground">After Tax</p>
                        <p className="text-lg font-medium text-green-600/70 dark:text-green-400/70">
                          {formatCurrency(convertedNet, displayCurrency, { showCode: false })}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Exchange Rate Footer */}
          {exchangeRates && (
            <div className="px-6 py-3 border-t bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-3 w-3" />
                <span>
                  1 {state.currency} = {rateWithMargin.toFixed(4)} {displayCurrency}
                  {state.traderMargin > 0 && (
                    <span className="text-muted-foreground/60"> (incl. {state.traderMargin}% margin)</span>
                  )}
                </span>
              </div>
              <span>{calculation.billableHours.toLocaleString()} hrs/yr</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exchange Rate Display */}
      <ExchangeRateDisplay baseCurrency={state.currency} />

      {/* Settings Sections */}
      <div className="space-y-1 rounded-xl border bg-card/50 p-1">
        {/* Currency & Margin */}
        <Collapsible open={openSection === 'currency'} onOpenChange={() => toggleSection('currency')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {openSection === 'currency' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <span>Currency & Margin</span>
            </div>
            <Badge variant="secondary">
              {state.traderMargin > 0 ? `${state.traderMargin}% margin` : 'No margin'}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-3 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Trader/Bank Margin</Label>
                <span className="text-sm font-medium tabular-nums">{state.traderMargin}%</span>
              </div>
              <Slider
                value={[state.traderMargin]}
                onValueChange={([value]) => updateState({ traderMargin: value })}
                max={10}
                step={0.5}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Simulates fees from banks, wire transfers, or platforms like Wise/PayPal
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Location & Holidays */}
        <Collapsible open={openSection === 'location'} onOpenChange={() => toggleSection('location')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {openSection === 'location' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Location & Holidays</span>
            </div>
            <Badge variant="secondary">
              {currentCountry?.flag} {state.region} · {state.holidaysPerYear} days
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Country</Label>
                <Select value={state.country} onValueChange={handleCountryChange}>
                  <SelectTrigger aria-label="Select country">
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
              <div className="space-y-2">
                <Label className="text-sm">Province/State</Label>
                <Select value={state.region} onValueChange={handleRegionChange}>
                  <SelectTrigger aria-label="Select region">
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
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Statutory Holidays</Label>
              <Input
                type="number"
                min={0}
                max={20}
                value={state.holidaysPerYear || ''}
                onChange={(e) => updateState({ holidaysPerYear: parseInt(e.target.value) || 0 })}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Time Off */}
        <Collapsible open={openSection === 'timeoff'} onOpenChange={() => toggleSection('timeoff')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {openSection === 'timeoff' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Time Off</span>
            </div>
            <Badge variant="secondary">
              {state.unlimitedPTO ? 'Paid' : `${state.ptoDays + state.sickDays} days`}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-3 space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="unlimitedPTO" className="font-medium">Paid Time Off</Label>
                <p className="text-xs text-muted-foreground">
                  Employer provides paid vacation, sick days, etc.
                </p>
              </div>
              <Switch
                id="unlimitedPTO"
                checked={state.unlimitedPTO}
                onCheckedChange={(checked) => updateState({ unlimitedPTO: checked })}
              />
            </div>
            {!state.unlimitedPTO && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">PTO Days</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={state.ptoDays || ''}
                    onChange={(e) => updateState({ ptoDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Sick Days</Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={state.sickDays || ''}
                    onChange={(e) => updateState({ sickDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Work Schedule */}
        <Collapsible open={openSection === 'schedule'} onOpenChange={() => toggleSection('schedule')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {openSection === 'schedule' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Work Schedule</span>
            </div>
            <Badge variant="secondary">
              {state.hoursPerDay * state.daysPerWeek} hrs/wk
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Hours per Day</Label>
                <Input
                  type="number"
                  min={1}
                  max={16}
                  value={state.hoursPerDay || ''}
                  onChange={(e) => updateState({ hoursPerDay: parseInt(e.target.value) || 8 })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Days per Week</Label>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={state.daysPerWeek || ''}
                  onChange={(e) => updateState({ daysPerWeek: parseInt(e.target.value) || 5 })}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tax Estimate */}
        <Collapsible open={openSection === 'tax'} onOpenChange={() => toggleSection('tax')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {openSection === 'tax' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span>Tax Estimate</span>
            </div>
            <Badge variant="secondary">
              {state.showTaxEstimate ? formatPercent(calculation.taxBreakdown.effectiveRate) : 'Off'}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-3 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showTax" className="text-sm">Show tax estimate</Label>
              <Switch
                id="showTax"
                checked={state.showTaxEstimate}
                onCheckedChange={(checked) => updateState({ showTaxEstimate: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="selfEmployed" className="text-sm">Self-employed / contractor</Label>
              <Switch
                id="selfEmployed"
                checked={state.isSelfEmployed}
                onCheckedChange={(checked) => updateState({ isSelfEmployed: checked })}
              />
            </div>
            {state.showTaxEstimate && (
              <div className="space-y-2 text-sm pt-2">
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
                      {state.country === 'CA' ? 'CPP' : 'Self-Employment'}
                    </span>
                    <span>{formatCurrency(calculation.taxBreakdown.selfEmployment, state.currency, { showCode: false })}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Tax</span>
                  <span>{formatCurrency(calculation.taxBreakdown.total, state.currency, { showCode: false })}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Estimate only · Consult a tax professional
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
