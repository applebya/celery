import { useState, useCallback } from "react";
import { ChevronRight, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedNumber } from "./AnimatedNumber";
import { getCountry } from "@/data/holidays-2026";
import { useCalculation } from "@/hooks/useCalculation";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { formatCurrency, formatPercent } from "@/lib/calculate";
import type { CalculatorState, Currency, EmploymentType } from "@/types";
import { isSelfEmployedFromType } from "@/types";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "CAD", label: "CAD", symbol: "C$" },
  { value: "USD", label: "USD", symbol: "$" },
  { value: "EUR", label: "EUR", symbol: "€" },
  { value: "GBP", label: "GBP", symbol: "£" },
  { value: "MXN", label: "MXN", symbol: "$" },
];

const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: "🇺🇸",
  CAD: "🇨🇦",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  MXN: "🇲🇽",
};

const MARGIN_PRESETS = [
  { label: "Wise", value: 0.5 },
  { label: "Bank", value: 2.5 },
  { label: "PayPal", value: 3.5 },
] as const;

const EMPLOYMENT_TYPES: {
  value: EmploymentType;
  label: string;
  shortLabel: string;
  tooltip: string;
}[] = [
  {
    value: "contractor-hourly",
    label: "Contractor (hourly)",
    shortLabel: "Contractor",
    tooltip: "Self-employed, bill by the hour",
  },
  {
    value: "contractor-retainer",
    label: "Contractor (retainer)",
    shortLabel: "Retainer",
    tooltip: "Fixed monthly fee",
  },
  {
    value: "employee-hourly",
    label: "Employee (hourly)",
    shortLabel: "Employee",
    tooltip: "W-2/T4 paid by hour",
  },
  {
    value: "employee-salary",
    label: "Employee (salary)",
    shortLabel: "Salary",
    tooltip: "W-2/T4 fixed salary",
  },
];

interface CalculatorProps {
  state: CalculatorState;
  onChange: (state: CalculatorState) => void;
  onRename?: (name: string) => void;
}

export function Calculator({ state, onChange, onRename }: CalculatorProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);

  const calculation = useCalculation(state);
  const { convertWithMargin } = useExchangeRate();

  const updateState = useCallback(
    (updates: Partial<CalculatorState>) => {
      onChange({ ...state, ...updates });
    },
    [state, onChange],
  );

  const handleEmploymentTypeChange = useCallback(
    (employmentType: EmploymentType) => {
      const isSelfEmployed = isSelfEmployedFromType(employmentType);
      let calculationMode = state.calculationMode;
      if (employmentType === "employee-salary") {
        calculationMode = "salaryToHourly";
      } else if (
        employmentType === "contractor-hourly" ||
        employmentType === "employee-hourly"
      ) {
        calculationMode = "hourlyToSalary";
      }
      updateState({
        employmentType,
        isSelfEmployed,
        calculationMode,
      });
    },
    [state.calculationMode, updateState],
  );

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Currency conversion - auto-determine based on home currency
  // CAD/MXN users see USD, USD users see CAD
  const displayCurrency: Currency = state.currency === "USD" ? "CAD" : "USD";

  const convertedGross = convertWithMargin(
    calculation.grossAnnual,
    state.currency,
    displayCurrency,
    state.traderMargin,
  );

  const convertedNet = convertWithMargin(
    calculation.netAnnual,
    state.currency,
    displayCurrency,
    state.traderMargin,
  );

  // Conversion fee calculation
  const conversionFeeAmount =
    (state.showTaxEstimate ? calculation.netAnnual : calculation.grossAnnual) *
    (state.traderMargin / 100);

  // Period breakdowns
  const monthly = calculation.netAnnual / 12;
  const biweekly = calculation.netAnnual / 26;
  const weekly = calculation.netAnnual / 52;
  const billableDays = calculation.billableHours / state.hoursPerDay;
  const daily = calculation.netAnnual / billableDays;

  // Work schedule summary
  const hoursPerWeek = state.hoursPerDay * state.daysPerWeek;
  const hoursPerMonth = Math.round(calculation.billableHours / 12);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
      {/* Left Column - Inputs */}
      <div className="flex-1 space-y-5">
        {/* Employment Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Employment type</Label>
          <div className="flex flex-wrap gap-2">
            {EMPLOYMENT_TYPES.map((type) => {
              const isSelected = state.employmentType === type.value;
              return (
                <TooltipProvider key={type.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleEmploymentTypeChange(type.value)}
                        className={`
                          px-3 py-2 text-sm rounded-lg border transition-all
                          ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card hover:bg-muted border-border"
                          }
                        `}
                      >
                        {type.shortLabel}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{type.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        {/* Rate Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {state.employmentType === "contractor-retainer"
              ? "Monthly retainer"
              : state.employmentType === "employee-salary"
                ? "Annual salary"
                : "Hourly rate"}
          </Label>
          <div className="flex gap-2">
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                min={0}
                value={
                  state.employmentType === "contractor-retainer"
                    ? state.monthlyRetainer || ""
                    : state.employmentType === "employee-salary"
                      ? state.targetSalary || ""
                      : state.hourlyRate || ""
                }
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (state.employmentType === "contractor-retainer") {
                    updateState({ monthlyRetainer: val });
                  } else if (state.employmentType === "employee-salary") {
                    updateState({ targetSalary: val });
                  } else {
                    updateState({ hourlyRate: val });
                    // Auto-update title if not customized
                    if (onRename && val > 0) {
                      const countryData = getCountry(state.country);
                      const regionData = countryData?.regions.find(
                        (r) => r.code === state.region,
                      );
                      const regionName = regionData?.name ?? state.region;
                      onRename(`$${val}/hr in ${regionName}`);
                    }
                  }
                }}
                className="pl-7 h-10 text-base tabular-nums"
              />
            </div>
            <Select
              value={state.currency}
              onValueChange={(v) => updateState({ currency: v as Currency })}
            >
              <SelectTrigger className="w-24 h-10">
                <SelectValue>
                  <span className="mr-1">{CURRENCY_FLAGS[state.currency]}</span>
                  <span>{state.currency}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {CURRENCY_FLAGS[c.value]} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Schedule Summary (compact) */}
        <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Schedule</span>
          <span className="text-sm tabular-nums">
            {state.employmentType === "contractor-retainer" ? (
              <>
                {state.expectedHoursMin}–{state.expectedHoursMax} hrs/mo
              </>
            ) : state.useFixedMonthlyHours ? (
              <>
                {state.fixedMonthlyHours || 160} hrs/mo ·{" "}
                {calculation.billableHours.toLocaleString()} hrs/yr
              </>
            ) : (
              <>
                {hoursPerWeek} hrs/wk · {hoursPerMonth} hrs/mo ·{" "}
                {calculation.billableHours.toLocaleString()} hrs/yr
              </>
            )}
          </span>
        </div>

        {/* Collapsible Settings */}
        <div className="space-y-1 rounded-lg border bg-card overflow-hidden">
          {/* Schedule Settings */}
          <Collapsible
            open={openSection === "schedule"}
            onOpenChange={() => toggleSection("schedule")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium">Work schedule</span>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === "schedule" ? "rotate-90" : ""}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 space-y-4">
              {state.employmentType === "contractor-retainer" ? (
                /* Retainer: just expected hours range */
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Expected hours per month for this retainer
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Min hrs/mo
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={300}
                        value={state.expectedHoursMin || ""}
                        onChange={(e) =>
                          updateState({
                            expectedHoursMin: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-24 h-9 tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Max hrs/mo
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={300}
                        value={state.expectedHoursMax || ""}
                        onChange={(e) =>
                          updateState({
                            expectedHoursMax: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-24 h-9 tabular-nums"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used to calculate your effective hourly rate range
                  </p>
                </div>
              ) : (
                /* Non-retainer: full schedule details */
                <>
                  {/* Fixed monthly hours toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fixedMonthly" className="text-sm">
                      Fixed monthly hours
                    </Label>
                    <Switch
                      id="fixedMonthly"
                      checked={state.useFixedMonthlyHours}
                      onCheckedChange={(checked) =>
                        updateState({ useFixedMonthlyHours: checked })
                      }
                    />
                  </div>

                  {state.useFixedMonthlyHours ? (
                    /* Fixed monthly hours mode */
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Hours per month
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={300}
                        value={state.fixedMonthlyHours || 160}
                        onChange={(e) =>
                          updateState({
                            fixedMonthlyHours: parseInt(e.target.value) || 160,
                          })
                        }
                        className="w-24 h-9 tabular-nums"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        ={" "}
                        {(
                          (state.fixedMonthlyHours || 160) * 12
                        ).toLocaleString()}{" "}
                        hrs/year
                      </p>
                    </div>
                  ) : (
                    /* Calculated schedule mode */
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Hours/day
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={16}
                            value={state.hoursPerDay || ""}
                            onChange={(e) =>
                              updateState({
                                hoursPerDay: parseInt(e.target.value) || 8,
                              })
                            }
                            className="h-9 tabular-nums"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Days/week
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={7}
                            value={state.daysPerWeek || ""}
                            onChange={(e) =>
                              updateState({
                                daysPerWeek: parseInt(e.target.value) || 5,
                              })
                            }
                            className="h-9 tabular-nums"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Holidays
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            value={state.holidaysPerYear || ""}
                            onChange={(e) =>
                              updateState({
                                holidaysPerYear: parseInt(e.target.value) || 0,
                              })
                            }
                            className="h-9 tabular-nums"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            PTO days
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            max={60}
                            value={state.ptoDays || ""}
                            onChange={(e) =>
                              updateState({
                                ptoDays: parseInt(e.target.value) || 0,
                              })
                            }
                            className="h-9 tabular-nums"
                            disabled={state.unlimitedPTO}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Sick days
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            max={30}
                            value={state.sickDays || ""}
                            onChange={(e) =>
                              updateState({
                                sickDays: parseInt(e.target.value) || 0,
                              })
                            }
                            className="h-9 tabular-nums"
                            disabled={state.unlimitedPTO}
                          />
                        </div>
                        <div />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="unlimitedPTO" className="text-sm">
                          Paid time off
                        </Label>
                        <Switch
                          id="unlimitedPTO"
                          checked={state.unlimitedPTO}
                          onCheckedChange={(checked) =>
                            updateState({ unlimitedPTO: checked })
                          }
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Tax Settings */}
          <Collapsible
            open={openSection === "tax"}
            onOpenChange={() => toggleSection("tax")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Taxes (before expenses)
                </span>
                {state.showTaxEstimate && (
                  <span className="text-xs text-muted-foreground">
                    {formatPercent(calculation.taxBreakdown.effectiveRate)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={state.showTaxEstimate}
                  onCheckedChange={(checked) => {
                    updateState({ showTaxEstimate: checked });
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === "tax" ? "rotate-90" : ""}`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 space-y-3">
              {state.showTaxEstimate && (
                <div className="space-y-3 text-sm">
                  {/* Federal brackets */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground font-medium">
                        Federal
                      </span>
                      <span className="tabular-nums">
                        {formatCurrency(
                          calculation.taxBreakdown.federal,
                          state.currency,
                          { showCode: false },
                        )}
                      </span>
                    </div>
                    <div className="pl-2 space-y-0.5 text-xs">
                      {calculation.federalBrackets.map((b, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-muted-foreground"
                        >
                          <span>{(b.rate * 100).toFixed(0)}%</span>
                          <span className="tabular-nums">
                            {formatCurrency(b.taxAmount, state.currency, {
                              showCode: false,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provincial/State brackets */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground font-medium">
                        {state.country === "CA" ? "Provincial" : "State"}
                      </span>
                      <span className="tabular-nums">
                        {formatCurrency(
                          calculation.taxBreakdown.provincialState,
                          state.currency,
                          { showCode: false },
                        )}
                      </span>
                    </div>
                    {calculation.provincialStateBrackets.length > 0 ? (
                      <div className="pl-2 space-y-0.5 text-xs">
                        {calculation.provincialStateBrackets.map((b, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-muted-foreground"
                          >
                            <span>{(b.rate * 100).toFixed(1)}%</span>
                            <span className="tabular-nums">
                              {formatCurrency(b.taxAmount, state.currency, {
                                showCode: false,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-2 text-xs text-muted-foreground">
                        No state income tax
                      </div>
                    )}
                  </div>

                  {/* Self-employment */}
                  {state.isSelfEmployed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">
                        {state.country === "CA" ? "CPP" : "Self-Emp"}
                      </span>
                      <span className="tabular-nums">
                        {formatCurrency(
                          calculation.taxBreakdown.selfEmployment,
                          state.currency,
                          { showCode: false },
                        )}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total tax</span>
                    <span className="tabular-nums">
                      {formatCurrency(
                        calculation.taxBreakdown.total,
                        state.currency,
                        { showCode: false },
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Currency Conversion */}
          <Collapsible
            open={openSection === "currency"}
            onOpenChange={() => toggleSection("currency")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors border-t">
              <span className="text-sm font-medium">Currency conversion</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={state.showCurrencyConversion}
                  onCheckedChange={(checked) =>
                    updateState({ showCurrencyConversion: checked })
                  }
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === "currency" ? "rotate-90" : ""}`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 space-y-4">
              {state.showCurrencyConversion && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Converting {state.currency} → {displayCurrency}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label className="text-xs text-muted-foreground">
                        Conversion margin
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Fee charged by your bank or payment provider when
                              converting currencies
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MARGIN_PRESETS.map((preset) => {
                        const isPresetSelected =
                          state.traderMargin === preset.value;
                        return (
                          <button
                            key={preset.label}
                            onClick={() =>
                              updateState({ traderMargin: preset.value })
                            }
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              isPresetSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {preset.label} ({preset.value}%)
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[state.traderMargin]}
                        onValueChange={([value]) =>
                          updateState({ traderMargin: value })
                        }
                        max={25}
                        step={0.5}
                        className="w-32"
                      />
                      <span className="text-sm tabular-nums w-10 text-right">
                        {state.traderMargin}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Right Column - Results */}
      <div className="w-full md:w-[400px] md:flex-shrink-0 md:sticky md:top-6 md:self-start">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          {/* Gross in primary currency */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Gross (before tax)
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              <span className="mr-1.5">{CURRENCY_FLAGS[state.currency]}</span>
              <AnimatedNumber
                value={calculation.grossAnnual}
                formatter={(v) => formatCurrency(v, state.currency)}
              />
              <span className="text-sm text-muted-foreground font-normal ml-1">
                /year
              </span>
            </div>
          </div>

          {/* Gross converted (if currency conversion enabled) */}
          {state.showCurrencyConversion && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-lg">→</span>
              <span className="text-xl font-medium tabular-nums text-foreground">
                {CURRENCY_FLAGS[displayCurrency]}{" "}
                <AnimatedNumber
                  value={convertedGross}
                  formatter={(v) => formatCurrency(v, displayCurrency)}
                />
              </span>
            </div>
          )}

          {/* Deductions section */}
          {(state.showTaxEstimate ||
            (state.showCurrencyConversion && state.traderMargin > 0)) && (
            <div className="py-3 px-4 bg-muted/30 rounded-lg space-y-1.5">
              {state.showTaxEstimate && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                    className="w-full flex justify-between items-center text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ChevronRight
                        className={`h-3 w-3 transition-transform ${showTaxBreakdown ? "rotate-90" : ""}`}
                      />
                      Taxes (
                      {formatPercent(calculation.taxBreakdown.effectiveRate)})
                    </span>
                    <span className="tabular-nums text-destructive">
                      −
                      {formatCurrency(
                        calculation.taxBreakdown.total,
                        state.currency,
                      )}{" "}
                      {state.currency}
                    </span>
                  </button>

                  {/* Tax bracket breakdown */}
                  {showTaxBreakdown && (
                    <div className="pl-4 space-y-2 text-xs border-l-2 border-border/50 ml-1">
                      {/* Federal brackets */}
                      {calculation.federalBrackets.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-muted-foreground font-medium">
                            Federal
                          </div>
                          {calculation.federalBrackets.map((bracket, i) => (
                            <div
                              key={i}
                              className="flex justify-between text-muted-foreground"
                            >
                              <span>
                                {formatPercent(bracket.rate)} on{" "}
                                {formatCurrency(
                                  bracket.taxableAmount,
                                  state.currency,
                                  { showCode: false },
                                )}
                              </span>
                              <span className="tabular-nums">
                                {formatCurrency(
                                  bracket.taxAmount,
                                  state.currency,
                                  { showCode: false },
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Provincial/State brackets */}
                      {calculation.provincialStateBrackets.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-muted-foreground font-medium">
                            {state.country === "CA" ? "Provincial" : "State"}
                          </div>
                          {calculation.provincialStateBrackets.map(
                            (bracket, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-muted-foreground"
                              >
                                <span>
                                  {formatPercent(bracket.rate)} on{" "}
                                  {formatCurrency(
                                    bracket.taxableAmount,
                                    state.currency,
                                    { showCode: false },
                                  )}
                                </span>
                                <span className="tabular-nums">
                                  {formatCurrency(
                                    bracket.taxAmount,
                                    state.currency,
                                    { showCode: false },
                                  )}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      {/* Self-employment tax */}
                      {calculation.taxBreakdown.selfEmployment > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Self-employment</span>
                          <span className="tabular-nums">
                            {formatCurrency(
                              calculation.taxBreakdown.selfEmployment,
                              state.currency,
                              { showCode: false },
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {state.showCurrencyConversion && state.traderMargin > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Conversion fees ({state.traderMargin}%)
                  </span>
                  <span className="tabular-nums text-destructive">
                    −
                    {formatCurrency(conversionFeeAmount, state.currency, {
                      showCode: false,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Take-home (primary) */}
          {state.showTaxEstimate && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm text-muted-foreground">
                  Take-home (after tax)
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        After income tax. Doesn't include health insurance,
                        retirement, or other deductions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-3xl font-bold tabular-nums text-primary">
                <span className="mr-1.5">{CURRENCY_FLAGS[state.currency]}</span>
                <AnimatedNumber
                  value={calculation.netAnnual}
                  formatter={(v) => formatCurrency(v, state.currency)}
                />
                <span className="text-sm text-muted-foreground font-normal ml-1">
                  /year
                </span>
              </div>
            </div>
          )}

          {/* Take-home converted (if currency conversion enabled and taxes shown) */}
          {state.showCurrencyConversion && state.showTaxEstimate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-lg">→</span>
              <span className="text-xl font-medium tabular-nums text-foreground">
                {CURRENCY_FLAGS[displayCurrency]}{" "}
                <AnimatedNumber
                  value={convertedNet}
                  formatter={(v) => formatCurrency(v, displayCurrency)}
                />
              </span>
            </div>
          )}

          {/* Period breakdown */}
          <div className="pt-4 border-t space-y-2">
            <div className="text-sm text-muted-foreground mb-2">Breakdown</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(monthly, state.currency, { showCode: false })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bi-weekly</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(biweekly, state.currency, {
                    showCode: false,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weekly</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(weekly, state.currency, { showCode: false })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(daily, state.currency, { showCode: false })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
