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
import { DATA_YEAR } from "@/data/tax-brackets-2026";
import { useCalculation } from "@/hooks/useCalculation";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { formatCurrency, formatPercent, calcNetAnnual } from "@/lib/calculate";
import {
  getTaxBreakdown,
  getFederalBracketDetails,
  getProvincialStateBracketDetails,
} from "@/lib/tax";
import type { CalculatorState, Currency, EmploymentType } from "@/types";
import { isSelfEmployedFromType } from "@/types";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "USD", symbol: "$" },
  { value: "CAD", label: "CAD", symbol: "C$" },
  { value: "EUR", label: "EUR", symbol: "€" },
  { value: "GBP", label: "GBP", symbol: "£" },
  { value: "AUD", label: "AUD", symbol: "A$" },
  { value: "NZD", label: "NZD", symbol: "NZ$" },
  { value: "CHF", label: "CHF", symbol: "Fr" },
  { value: "JPY", label: "JPY", symbol: "¥" },
  { value: "INR", label: "INR", symbol: "₹" },
  { value: "BRL", label: "BRL", symbol: "R$" },
  { value: "MXN", label: "MXN", symbol: "$" },
  { value: "SGD", label: "SGD", symbol: "S$" },
  { value: "HKD", label: "HKD", symbol: "HK$" },
  { value: "SEK", label: "SEK", symbol: "kr" },
  { value: "NOK", label: "NOK", symbol: "kr" },
  { value: "DKK", label: "DKK", symbol: "kr" },
  { value: "PLN", label: "PLN", symbol: "zł" },
  { value: "CZK", label: "CZK", symbol: "Kč" },
  { value: "ILS", label: "ILS", symbol: "₪" },
  { value: "ZAR", label: "ZAR", symbol: "R" },
];

const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: "🇺🇸",
  CAD: "🇨🇦",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CHF: "🇨🇭",
  JPY: "🇯🇵",
  INR: "🇮🇳",
  BRL: "🇧🇷",
  MXN: "🇲🇽",
  SGD: "🇸🇬",
  HKD: "🇭🇰",
  SEK: "🇸🇪",
  NOK: "🇳🇴",
  DKK: "🇩🇰",
  PLN: "🇵🇱",
  CZK: "🇨🇿",
  ILS: "🇮🇱",
  ZAR: "🇿🇦",
};

const MARGIN_PRESETS = [
  { label: "Wise", value: 0.5 },
  { label: "Bank", value: 2.5 },
  { label: "PayPal", value: 3.5 },
] as const;

const TAX_TREATMENT_OPTIONS = [
  { value: "taxable", label: "Taxable" },
  { value: "nonTaxable", label: "Non-taxable" },
  { value: "nonCash", label: "Non-cash" },
] as const;

const EQUITY_MODE_OPTIONS = [
  { value: "annual", label: "Annual value" },
  { value: "vesting", label: "Grant + vesting" },
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
    label: "Employee",
    shortLabel: "Employee",
    tooltip: "W-2/T4 employee",
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

  const isEmployee =
    state.employmentType === "employee-hourly" ||
    state.employmentType === "employee-salary";
  const employeeSalaryMode = state.calculationMode === "salaryToHourly";

  const handleEmploymentTypeChange = useCallback(
    (employmentType: EmploymentType) => {
      const isSelfEmployed = isSelfEmployedFromType(employmentType);
      let calculationMode = state.calculationMode;
      // When switching to employee, keep current calc mode if already employee
      if (employmentType === "employee-hourly" && !isEmployee) {
        calculationMode = "hourlyToSalary";
      } else if (
        employmentType === "contractor-hourly" ||
        employmentType === "contractor-retainer"
      ) {
        calculationMode = "hourlyToSalary";
      }
      updateState({
        employmentType,
        isSelfEmployed,
        calculationMode,
      });
    },
    [state.calculationMode, isEmployee, updateState],
  );

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Home currency based on tax residence country
  const countryInfo = getCountry(state.country);
  const homeCurrency: Currency = countryInfo?.currency ?? "CAD";

  // Currency conversion - only show if job currency differs from home currency
  const displayCurrency: Currency = state.currency === "USD" ? "CAD" : "USD";
  const shouldShowConversion =
    state.showCurrencyConversion && state.currency !== homeCurrency;
  const currenciesDiffer = state.currency !== homeCurrency;

  // Convert gross to home currency (for tax calculation when currencies differ)
  const grossInHomeCurrency = currenciesDiffer
    ? convertWithMargin(
        calculation.grossBaseAnnual,
        state.currency,
        homeCurrency,
        0,
      )
    : calculation.grossBaseAnnual;

  // Recalculate taxes on home currency amount when currencies differ
  // (You pay taxes in your home country based on converted income)
  const effectiveTaxBreakdown = currenciesDiffer
    ? getTaxBreakdown(
        state.country,
        state.region,
        grossInHomeCurrency,
        state.isSelfEmployed,
      )
    : calculation.taxBreakdown;

  const effectiveFederalBrackets = currenciesDiffer
    ? getFederalBracketDetails(state.country, grossInHomeCurrency)
    : calculation.federalBrackets;

  const effectiveProvincialBrackets = currenciesDiffer
    ? getProvincialStateBracketDetails(
        state.country,
        state.region,
        grossInHomeCurrency,
      )
    : calculation.provincialStateBrackets;

  // Net base annual in home currency
  const netBaseInHomeCurrency = calcNetAnnual(
    grossInHomeCurrency,
    effectiveTaxBreakdown.total,
  );

  // For display: base net in job currency, converted from home currency net
  const netBaseInJobCurrency = currenciesDiffer
    ? convertWithMargin(netBaseInHomeCurrency, homeCurrency, state.currency, 0)
    : calculation.netBaseAnnual;

  // Extras-aware tax calculation in home currency (when currencies differ)
  const grossTaxableInHomeCurrency = currenciesDiffer
    ? convertWithMargin(
        calculation.grossTaxableAnnual,
        state.currency,
        homeCurrency,
        0,
      )
    : calculation.grossTaxableAnnual;

  const grossCashInHomeCurrency = currenciesDiffer
    ? convertWithMargin(
        calculation.grossCashAnnual,
        state.currency,
        homeCurrency,
        0,
      )
    : calculation.grossCashAnnual;

  const taxBreakdownWithExtras = getTaxBreakdown(
    state.country,
    state.region,
    grossTaxableInHomeCurrency,
    state.isSelfEmployed,
  );

  const netCashInHomeCurrency = calcNetAnnual(
    grossCashInHomeCurrency,
    taxBreakdownWithExtras.total,
  );

  const netCashInJobCurrency = currenciesDiffer
    ? convertWithMargin(netCashInHomeCurrency, homeCurrency, state.currency, 0)
    : calculation.netCashAnnual;

  const extrasTaxInHomeCurrency = Math.max(
    0,
    taxBreakdownWithExtras.total - effectiveTaxBreakdown.total,
  );

  // Conversion fee calculation
  const conversionFeeAmount = netBaseInJobCurrency * (state.traderMargin / 100);

  // Period breakdowns (use home currency net for accurate after-tax amounts)
  const netForBreakdown = currenciesDiffer
    ? netBaseInHomeCurrency
    : calculation.netBaseAnnual;
  const monthly = netForBreakdown / 12;
  const biweekly = netForBreakdown / 26;
  const weekly = netForBreakdown / 52;
  const billableDays =
    state.hoursPerDay > 0 ? calculation.billableHours / state.hoursPerDay : 0;
  const daily = billableDays > 0 ? netForBreakdown / billableDays : 0;

  const hasExtras =
    calculation.extrasCashTaxable +
      calculation.extrasCashNonTaxable +
      calculation.extrasNonCash >
    0;

  const signOnAnnualized =
    state.signOnBonus / Math.max(1, state.signOnYears || 1);

  // Convert extras to home currency for display in results column
  const convertExtra = (amount: number) =>
    currenciesDiffer
      ? convertWithMargin(amount, state.currency, homeCurrency, 0)
      : amount;
  const extrasCurrency = homeCurrency;
  const netCashInHomeCurrencyWithExtras = currenciesDiffer
    ? netCashInHomeCurrency + convertExtra(calculation.extrasNonCash)
    : netCashInJobCurrency + calculation.extrasNonCash;

  // Work schedule summary
  const hoursPerWeek = state.hoursPerDay * state.daysPerWeek;
  const hoursPerMonth = Math.round(calculation.billableHours / 12);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
      {/* Left Column - Inputs */}
      <div className="space-y-4 lg:space-y-6">
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
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {state.employmentType === "contractor-retainer"
                ? "Monthly retainer"
                : employeeSalaryMode
                  ? "Annual salary"
                  : "Hourly rate"}
            </Label>
            {isEmployee && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <button
                  onClick={() =>
                    updateState({
                      employmentType: "employee-hourly",
                      calculationMode: "hourlyToSalary",
                    })
                  }
                  className={`px-2 py-0.5 rounded transition-colors ${
                    !employeeSalaryMode
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  Hourly
                </button>
                <button
                  onClick={() =>
                    updateState({
                      employmentType: "employee-salary",
                      calculationMode: "salaryToHourly",
                    })
                  }
                  className={`px-2 py-0.5 rounded transition-colors ${
                    employeeSalaryMode
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  Salary
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type={employeeSalaryMode ? "text" : "number"}
                inputMode="numeric"
                min={0}
                value={
                  state.employmentType === "contractor-retainer"
                    ? state.monthlyRetainer || ""
                    : employeeSalaryMode
                      ? state.targetSalary
                        ? state.targetSalary.toLocaleString()
                        : ""
                      : state.hourlyRate || ""
                }
                onChange={(e) => {
                  // Remove commas for parsing
                  const rawValue = e.target.value.replace(/,/g, "");
                  const val = parseFloat(rawValue) || 0;
                  if (state.employmentType === "contractor-retainer") {
                    updateState({ monthlyRetainer: val });
                  } else if (employeeSalaryMode) {
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
              <SelectTrigger className="w-28 h-10">
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
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 lg:px-5 lg:py-3.5 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium">Work schedule</span>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === "schedule" ? "rotate-90" : ""}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 lg:px-5 lg:pb-5 space-y-4 lg:space-y-5">
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
                  <div className="flex items-center gap-2">
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

          {/* Tax Settings - hidden for OTHER country */}
          {state.country !== "OTHER" && (
            <Collapsible
              open={openSection === "tax"}
              onOpenChange={() => toggleSection("tax")}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 lg:px-5 lg:py-3.5 hover:bg-muted/50 transition-colors border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Taxes</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Uses {DATA_YEAR} federal brackets and payroll rates.
                          Regional taxes are approximate.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs text-muted-foreground">
                    {formatPercent(effectiveTaxBreakdown.effectiveRate)}
                  </span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === "tax" ? "rotate-90" : ""}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 lg:px-5 lg:pb-5 space-y-3 lg:space-y-4">
                <div className="space-y-3 lg:space-y-4 text-sm">
                  {/* Federal brackets */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground font-medium">
                        Federal
                      </span>
                      <span className="tabular-nums">
                        {formatCurrency(
                          effectiveTaxBreakdown.federal,
                          state.currency,
                          { showCode: false },
                        )}
                      </span>
                    </div>
                    <div className="pl-2 space-y-0.5 text-xs">
                      {effectiveFederalBrackets.map((b, i) => (
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
                          effectiveTaxBreakdown.provincialState,
                          state.currency,
                          { showCode: false },
                        )}
                      </span>
                    </div>
                    {effectiveProvincialBrackets.length > 0 ? (
                      <div className="pl-2 space-y-0.5 text-xs">
                        {effectiveProvincialBrackets.map((b, i) => (
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
                          effectiveTaxBreakdown.selfEmployment,
                          state.currency,
                          { showCode: false },
                        )}
                      </span>
                    </div>
                  )}

                  {/* Payroll */}
                  {!state.isSelfEmployed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">
                        {state.country === "CA"
                          ? "Payroll (CPP/EI)"
                          : "Payroll (FICA)"}
                      </span>
                      <span className="tabular-nums">
                        {formatCurrency(
                          effectiveTaxBreakdown.payroll,
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
                        effectiveTaxBreakdown.total,
                        state.currency,
                        { showCode: false },
                      )}
                    </span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Extras */}
          <Collapsible
            open={openSection === "extras"}
            onOpenChange={() => toggleSection("extras")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 lg:px-5 lg:py-3.5 hover:bg-muted/50 transition-colors border-t">
              <span className="text-sm font-medium">Extras</span>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === "extras" ? "rotate-90" : ""}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 lg:px-5 lg:pb-5 space-y-4 lg:space-y-5">
              <div className="space-y-4 lg:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Annual bonus
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={state.annualBonus || ""}
                      onChange={(e) =>
                        updateState({
                          annualBonus: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Tax treatment
                    </Label>
                    <Select
                      value={state.extrasTaxTreatment.bonus}
                      onValueChange={(v) =>
                        updateState({
                          extrasTaxTreatment: {
                            ...state.extrasTaxTreatment,
                            bonus: v as "taxable" | "nonTaxable" | "nonCash",
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_TREATMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Sign-on bonus (one-time)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={state.signOnBonus || ""}
                      onChange={(e) =>
                        updateState({
                          signOnBonus: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Spread (years)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={state.signOnYears || 1}
                      onChange={(e) =>
                        updateState({
                          signOnYears: Math.max(
                            1,
                            parseInt(e.target.value) || 1,
                          ),
                        })
                      }
                      className="h-9 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Tax treatment
                    </Label>
                    <Select
                      value={state.extrasTaxTreatment.signOn}
                      onValueChange={(v) =>
                        updateState({
                          extrasTaxTreatment: {
                            ...state.extrasTaxTreatment,
                            signOn: v as "taxable" | "nonTaxable" | "nonCash",
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_TREATMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Stipend (annual)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={state.stipendAnnual || ""}
                      onChange={(e) =>
                        updateState({
                          stipendAnnual: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Tax treatment
                    </Label>
                    <Select
                      value={state.extrasTaxTreatment.stipend}
                      onValueChange={(v) =>
                        updateState({
                          extrasTaxTreatment: {
                            ...state.extrasTaxTreatment,
                            stipend: v as "taxable" | "nonTaxable" | "nonCash",
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_TREATMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Employer match (annual)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={state.employerMatchAnnual || ""}
                      onChange={(e) =>
                        updateState({
                          employerMatchAnnual: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Tax treatment
                    </Label>
                    <Select
                      value={state.extrasTaxTreatment.match}
                      onValueChange={(v) =>
                        updateState({
                          extrasTaxTreatment: {
                            ...state.extrasTaxTreatment,
                            match: v as "taxable" | "nonTaxable" | "nonCash",
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_TREATMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Equity value
                    </Label>
                    <Select
                      value={state.equityMode}
                      onValueChange={(v) =>
                        updateState({
                          equityMode: v as "annual" | "vesting",
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUITY_MODE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {state.equityMode === "annual" ? (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Annual equity value
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={state.equityAnnualValue || ""}
                        onChange={(e) =>
                          updateState({
                            equityAnnualValue: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-9 tabular-nums"
                      />
                      <div className="text-xs text-muted-foreground">
                        Non-cash (not taxed)
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs text-muted-foreground">
                          Total grant value
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={state.equityGrantValue || ""}
                          onChange={(e) =>
                            updateState({
                              equityGrantValue: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-9 tabular-nums"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Vest (years)
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          value={state.equityVestYears || 4}
                          onChange={(e) =>
                            updateState({
                              equityVestYears: Math.max(
                                1,
                                parseInt(e.target.value) || 4,
                              ),
                            })
                          }
                          className="h-9 tabular-nums"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs text-muted-foreground">
                          Cliff (months)
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={state.equityCliffMonths || 0}
                          onChange={(e) =>
                            updateState({
                              equityCliffMonths: Math.max(
                                0,
                                parseInt(e.target.value) || 0,
                              ),
                            })
                          }
                          className="h-9 tabular-nums"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <Label className="text-xs text-muted-foreground">
                          Tax treatment
                        </Label>
                        <div className="h-9 flex items-center text-xs text-muted-foreground">
                          Non-cash
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Currency Conversion */}
          <Collapsible
            open={openSection === "currency"}
            onOpenChange={() => toggleSection("currency")}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 lg:px-5 lg:py-3.5 hover:bg-muted/50 transition-colors border-t">
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
            <CollapsibleContent className="px-4 pb-4 lg:px-5 lg:pb-5 space-y-4 lg:space-y-5">
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
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-xl border bg-card p-4 sm:p-5 lg:p-6 space-y-4 lg:space-y-5">
          {/* Gross section */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Gross (before tax)
            </div>
            {shouldShowConversion ? (
              <>
                {/* Job currency first (smaller) */}
                <div className="text-lg tabular-nums text-muted-foreground">
                  <span className="mr-1">{CURRENCY_FLAGS[state.currency]}</span>
                  <AnimatedNumber
                    value={calculation.grossBaseAnnual}
                    formatter={(v) => formatCurrency(v, state.currency)}
                  />
                  <span className="text-sm font-normal ml-1">/year</span>
                </div>
                {/* Arrow + Home currency (larger, green) */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground">→</span>
                  <span className="text-3xl font-bold tabular-nums text-primary">
                    {CURRENCY_FLAGS[homeCurrency]}{" "}
                    <AnimatedNumber
                      value={grossInHomeCurrency}
                      formatter={(v) => formatCurrency(v, homeCurrency)}
                    />
                  </span>
                </div>
              </>
            ) : (
              <div className="text-3xl font-bold tabular-nums text-primary">
                <span className="mr-1.5">{CURRENCY_FLAGS[state.currency]}</span>
                <AnimatedNumber
                  value={calculation.grossBaseAnnual}
                  formatter={(v) => formatCurrency(v, state.currency)}
                />
                <span className="text-sm text-muted-foreground font-normal ml-1">
                  /year
                </span>
              </div>
            )}
          </div>

          {/* Deductions section - hidden for OTHER country */}
          {state.country !== "OTHER" && (
            <div className="py-3 px-4 bg-muted/30 rounded-lg space-y-1.5">
              <div className="space-y-2">
                <button
                  onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                  className="w-full flex justify-between items-center text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${showTaxBreakdown ? "rotate-90" : ""}`}
                    />
                    Taxes ({formatPercent(effectiveTaxBreakdown.effectiveRate)})
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {DATA_YEAR} federal brackets and payroll rates.
                            Regional taxes are approximate.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <span className="tabular-nums text-destructive">
                    −{formatCurrency(effectiveTaxBreakdown.total, homeCurrency)}
                  </span>
                </button>

                {/* Tax bracket breakdown */}
                {showTaxBreakdown && (
                  <div className="pl-4 space-y-2 text-xs border-l-2 border-border/50 ml-1">
                    {/* Federal brackets */}
                    {effectiveFederalBrackets.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-medium">
                          Federal
                        </div>
                        {effectiveFederalBrackets.map((bracket, i) => (
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
                                {
                                  showCode: false,
                                },
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Provincial/State brackets */}
                    {effectiveProvincialBrackets.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-medium">
                          {state.country === "CA" ? "Provincial" : "State"}
                        </div>
                        {effectiveProvincialBrackets.map((bracket, i) => (
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
                                {
                                  showCode: false,
                                },
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Self-employment tax */}
                    {effectiveTaxBreakdown.selfEmployment > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Self-employment</span>
                        <span className="tabular-nums">
                          {formatCurrency(
                            effectiveTaxBreakdown.selfEmployment,
                            state.currency,
                            { showCode: false },
                          )}
                        </span>
                      </div>
                    )}

                    {/* Payroll tax */}
                    {effectiveTaxBreakdown.payroll > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>
                          {state.country === "CA"
                            ? "Payroll (CPP/EI)"
                            : "Payroll (FICA)"}
                        </span>
                        <span className="tabular-nums">
                          {formatCurrency(
                            effectiveTaxBreakdown.payroll,
                            state.currency,
                            { showCode: false },
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {shouldShowConversion && state.traderMargin > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Conversion fees ({state.traderMargin}%)
                  </span>
                  <span className="tabular-nums text-destructive">
                    −{formatCurrency(conversionFeeAmount, state.currency)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Take-home section */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm text-muted-foreground">
                Net cash (after tax)
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      After income and payroll taxes on base income. Extras are
                      added below.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {shouldShowConversion ? (
              <>
                {/* Job currency first (smaller) */}
                <div className="text-lg tabular-nums text-muted-foreground">
                  <span className="mr-1">{CURRENCY_FLAGS[state.currency]}</span>
                  <AnimatedNumber
                    value={netBaseInJobCurrency}
                    formatter={(v) => formatCurrency(v, state.currency)}
                  />
                  <span className="text-sm font-normal ml-1">/year</span>
                </div>
                {/* Arrow + Home currency (larger, green) */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground">→</span>
                  <span className="text-3xl font-bold tabular-nums text-primary">
                    {CURRENCY_FLAGS[homeCurrency]}{" "}
                    <AnimatedNumber
                      value={netBaseInHomeCurrency}
                      formatter={(v) => formatCurrency(v, homeCurrency)}
                    />
                  </span>
                </div>
              </>
            ) : (
              <div className="text-3xl font-bold tabular-nums text-primary">
                <span className="mr-1.5">{CURRENCY_FLAGS[state.currency]}</span>
                <AnimatedNumber
                  value={netBaseInJobCurrency}
                  formatter={(v) => formatCurrency(v, state.currency)}
                />
                <span className="text-sm text-muted-foreground font-normal ml-1">
                  /year
                </span>
              </div>
            )}
          </div>

          {/* Totals + Extras */}
          {hasExtras && (
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm text-muted-foreground mb-2">Totals</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total cash</span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(
                    currenciesDiffer
                      ? netCashInHomeCurrency
                      : netCashInJobCurrency,
                    extrasCurrency,
                    { showCode: false },
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total comp (incl. equity)
                </span>
                <span className="tabular-nums font-medium">
                  {formatCurrency(
                    netCashInHomeCurrencyWithExtras,
                    extrasCurrency,
                    { showCode: false },
                  )}
                </span>
              </div>

              <div className="pt-2 space-y-1 text-sm">
                {state.annualBonus > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Bonus</span>
                    <span className="tabular-nums">
                      {formatCurrency(
                        convertExtra(state.annualBonus),
                        extrasCurrency,
                        {
                          showCode: false,
                        },
                      )}
                    </span>
                  </div>
                )}
                {state.signOnBonus > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sign-on (annualized {state.signOnYears || 1}y)</span>
                    <span className="tabular-nums">
                      {formatCurrency(
                        convertExtra(signOnAnnualized),
                        extrasCurrency,
                        {
                          showCode: false,
                        },
                      )}
                    </span>
                  </div>
                )}
                {state.stipendAnnual > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Stipend</span>
                    <span className="tabular-nums">
                      {formatCurrency(
                        convertExtra(state.stipendAnnual),
                        extrasCurrency,
                        {
                          showCode: false,
                        },
                      )}
                    </span>
                  </div>
                )}
                {state.employerMatchAnnual > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Employer match</span>
                    <span className="tabular-nums">
                      {formatCurrency(
                        convertExtra(state.employerMatchAnnual),
                        extrasCurrency,
                        {
                          showCode: false,
                        },
                      )}
                    </span>
                  </div>
                )}
                {calculation.equityAnnualized > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Equity (annualized)</span>
                    <span className="tabular-nums">
                      {formatCurrency(
                        convertExtra(calculation.equityAnnualized),
                        extrasCurrency,
                        {
                          showCode: false,
                        },
                      )}
                    </span>
                  </div>
                )}
                {extrasTaxInHomeCurrency > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Estimated tax on extras</span>
                    <span className="tabular-nums">
                      −
                      {formatCurrency(extrasTaxInHomeCurrency, extrasCurrency, {
                        showCode: false,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Period breakdown */}
          <div className="pt-4 border-t space-y-2">
            <div className="text-sm text-muted-foreground mb-2">Breakdown</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:gap-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly</span>
                <span className="tabular-nums font-medium lg:text-base">
                  {formatCurrency(monthly, homeCurrency, { showCode: false })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bi-weekly</span>
                <span className="tabular-nums font-medium lg:text-base">
                  {formatCurrency(biweekly, homeCurrency, {
                    showCode: false,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weekly</span>
                <span className="tabular-nums font-medium lg:text-base">
                  {formatCurrency(weekly, homeCurrency, { showCode: false })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily</span>
                <span className="tabular-nums font-medium lg:text-base">
                  {formatCurrency(daily, homeCurrency, { showCode: false })}
                </span>
              </div>
              {state.employmentType === "contractor-retainer" && (
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">
                    Effective hourly range
                  </span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(
                      calculation.effectiveHourlyMin,
                      state.currency,
                      { showCode: false },
                    )}
                    {" – "}
                    {formatCurrency(
                      calculation.effectiveHourlyMax,
                      state.currency,
                      { showCode: false },
                    )}
                    /hr
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
