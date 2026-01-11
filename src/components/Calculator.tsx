import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, MapPin, Calendar, Clock, Receipt, Pencil, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExchangeRateDisplay } from './ExchangeRateDisplay'
import { countries, getCountry, getHolidayCount } from '@/data/holidays-2026'
import { useCalculation } from '@/hooks/useCalculation'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { formatCurrency, formatPercent } from '@/lib/calculate'
import type { CalculatorState, Currency } from '@/types'

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'CAD', label: 'CAD' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
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
  const { convertCurrency, exchangeRates } = useExchangeRate()

  const updateState = useCallback(
    (updates: Partial<CalculatorState>) => {
      onChange({ ...state, ...updates })
    },
    [state, onChange]
  )

  const handleCountryChange = useCallback(
    (country: 'CA' | 'US') => {
      const countryData = getCountry(country)
      const defaultRegion = country === 'CA' ? 'ON' : 'CA' // California for US
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
  // Pick a sensible alternate currency for conversions
  const otherCurrency: Currency = state.currency === 'USD' ? 'CAD'
    : state.currency === 'CAD' ? 'USD'
    : 'USD' // For EUR/GBP, show USD
  const convertedGross = convertCurrency(calculation.grossAnnual, state.currency, otherCurrency)

  return (
    <div className="space-y-4">
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

      {/* Input Section - changes based on mode */}
      {state.calculationMode === 'hourlyToSalary' ? (
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate</Label>
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
                className="pl-7 text-xl font-semibold"
              />
            </div>
            <Select value={state.currency} onValueChange={(v) => updateState({ currency: v as Currency })}>
              <SelectTrigger className="w-24">
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
          <Label htmlFor="targetSalary">Target Annual Salary</Label>
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
                className="pl-7 text-xl font-semibold"
              />
            </div>
            <Select value={state.currency} onValueChange={(v) => updateState({ currency: v as Currency })}>
              <SelectTrigger className="w-24">
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

      {/* Results Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="text-center space-y-2">
            {state.calculationMode === 'hourlyToSalary' ? (
              <>
                <p className="text-sm text-muted-foreground">Annual Compensation</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(calculation.grossAnnual, state.currency)}
                </p>
                {exchangeRates && (
                  <p className="text-sm text-muted-foreground">
                    = {formatCurrency(convertedGross, otherCurrency)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Required Hourly Rate</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(calculation.calculatedHourlyRate, state.currency)}/hr
                </p>
                {exchangeRates && (
                  <p className="text-sm text-muted-foreground">
                    = {formatCurrency(convertCurrency(calculation.calculatedHourlyRate, state.currency, otherCurrency), otherCurrency)}/hr
                  </p>
                )}
              </>
            )}
            {state.showTaxEstimate && (
              <div className="pt-1">
                <p className="text-lg text-green-600 dark:text-green-400">
                  After tax: ~{formatCurrency(calculation.netAnnual, state.currency)}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({formatPercent(calculation.taxBreakdown.effectiveRate)})
                  </span>
                </p>
                {exchangeRates && (
                  <p className="text-sm text-muted-foreground">
                    = {formatCurrency(convertCurrency(calculation.netAnnual, state.currency, otherCurrency), otherCurrency)}
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-2">
              {calculation.billableHours.toLocaleString()} billable hrs/yr
              {state.unlimitedPTO && ' (paid time off included)'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rate Display */}
      <ExchangeRateDisplay baseCurrency={state.currency} />

      {/* Collapsible Sections */}
      <div className="space-y-1 border rounded-lg p-1 bg-muted/20">
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
              {currentCountry?.flag} {state.region} · {state.holidaysPerYear}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pb-4 px-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={state.country} onValueChange={handleCountryChange}>
                  <SelectTrigger>
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
                <Label>Province/State</Label>
                <Select value={state.region} onValueChange={handleRegionChange}>
                  <SelectTrigger>
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
              <Label>Statutory Holidays</Label>
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
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>PTO Days</Label>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={state.ptoDays || ''}
                      onChange={(e) => updateState({ ptoDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sick Days</Label>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={state.sickDays || ''}
                      onChange={(e) => updateState({ sickDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </>
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
                <Label>Hours per Day</Label>
                <Input
                  type="number"
                  min={1}
                  max={16}
                  value={state.hoursPerDay || ''}
                  onChange={(e) => updateState({ hoursPerDay: parseInt(e.target.value) || 8 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Days per Week</Label>
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
              <Label htmlFor="showTax">Show tax estimate</Label>
              <Switch
                id="showTax"
                checked={state.showTaxEstimate}
                onCheckedChange={(checked) => updateState({ showTaxEstimate: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="selfEmployed">Self-employed / contractor</Label>
              <Switch
                id="selfEmployed"
                checked={state.isSelfEmployed}
                onCheckedChange={(checked) => updateState({ isSelfEmployed: checked })}
              />
            </div>
            {state.showTaxEstimate && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Federal</span>
                  <span>{formatCurrency(calculation.taxBreakdown.federal, state.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {state.country === 'CA' ? 'Provincial' : 'State'}
                  </span>
                  <span>{formatCurrency(calculation.taxBreakdown.provincialState, state.currency)}</span>
                </div>
                {state.isSelfEmployed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {state.country === 'CA' ? 'CPP' : 'Self-Employment'}
                    </span>
                    <span>{formatCurrency(calculation.taxBreakdown.selfEmployment, state.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Tax</span>
                  <span>{formatCurrency(calculation.taxBreakdown.total, state.currency)}</span>
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
