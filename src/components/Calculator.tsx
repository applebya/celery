import { useState, useCallback } from "react";
import {
  ChevronRight,
  Calendar,
  Receipt,
  Pencil,
  Check,
  ArrowRightLeft,
  HelpCircle,
  Share2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedNumber } from "./AnimatedNumber";
import { ExchangeRateDisplay } from "./ExchangeRateDisplay";
import { countries, getCountry, getHolidayCount } from "@/data/holidays-2026";
import { useCalculation } from "@/hooks/useCalculation";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useUrlState } from "@/hooks/useUrlState";
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
    shortLabel: "Hourly",
    tooltip:
      "Self-employed, bill by the hour. You handle your own taxes, benefits, and time off.",
  },
  {
    value: "contractor-retainer",
    label: "Contractor (retainer)",
    shortLabel: "Retainer",
    tooltip:
      "Fixed monthly fee regardless of hours. Common for ongoing client relationships.",
  },
  {
    value: "employee-hourly",
    label: "Employee (hourly)",
    shortLabel: "Hourly",
    tooltip:
      "W-2/T4 employee paid by the hour. Employer handles tax withholding.",
  },
  {
    value: "employee-salary",
    label: "Employee (salary)",
    shortLabel: "Salary",
    tooltip:
      "W-2/T4 employee with fixed annual salary. Employer handles tax withholding.",
  },
];

interface CalculatorProps {
  state: CalculatorState;
  onChange: (state: CalculatorState) => void;
  showTitle?: boolean;
}

export function Calculator({
  state,
  onChange,
  showTitle = false,
}: CalculatorProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(state.title);

  const calculation = useCalculation(state);
  const { convertWithMargin, exchangeRates, getRate, error } =
    useExchangeRate();
  const { getShareUrl } = useUrlState(state, onChange);

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail - clipboard API not available
    }
  };

  const updateState = useCallback(
    (updates: Partial<CalculatorState>) => {
      onChange({ ...state, ...updates });
    },
    [state, onChange],
  );

  const handleCountryChange = useCallback(
    (country: "CA" | "US") => {
      const countryData = getCountry(country);
      const defaultRegion = country === "CA" ? "ON" : "CA";
      const holidays = getHolidayCount(country, defaultRegion);
      updateState({
        country,
        region: defaultRegion,
        currency: countryData?.currency ?? "CAD",
        holidaysPerYear: holidays,
      });
    },
    [updateState],
  );

  const handleRegionChange = useCallback(
    (region: string) => {
      const holidays = getHolidayCount(state.country, region);
      updateState({ region, holidaysPerYear: holidays });
    },
    [state.country, updateState],
  );

  const handleEmploymentTypeChange = useCallback(
    (employmentType: EmploymentType) => {
      const isSelfEmployed = isSelfEmployedFromType(employmentType);

      // Map employment type to calculation mode
      let calculationMode = state.calculationMode;
      if (employmentType === "employee-salary") {
        calculationMode = "salaryToHourly";
      } else if (
        employmentType === "contractor-hourly" ||
        employmentType === "employee-hourly"
      ) {
        calculationMode = "hourlyToSalary";
      }
      // contractor-retainer keeps its own mode (uses monthlyRetainer)

      updateState({
        employmentType,
        isSelfEmployed,
        calculationMode,
      });
    },
    [state.calculationMode, updateState],
  );

  const toggleSection = (section: string) => {
    if (openSection === "all") {
      // When all expanded, clicking one collapses to just that one
      setOpenSection(section);
      setAllExpanded(false);
    } else {
      setOpenSection(openSection === section ? null : section);
    }
  };

  const toggleAllSections = () => {
    if (allExpanded) {
      setOpenSection(null);
    } else {
      setOpenSection("all");
    }
    setAllExpanded(!allExpanded);
  };

  const handleTitleSave = () => {
    updateState({ title: titleInput });
    setEditingTitle(false);
  };

  const currentCountry = getCountry(state.country);

  // Auto-select display currency if same as main
  const displayCurrency =
    state.displayCurrency === state.currency
      ? state.currency === "USD"
        ? "CAD"
        : "USD"
      : state.displayCurrency;

  // Calculate converted amounts with margin
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
  const convertedHourly = convertWithMargin(
    calculation.calculatedHourlyRate,
    state.currency,
    displayCurrency,
    state.traderMargin,
  );

  const effectiveRate = getRate(state.currency, displayCurrency);
  const rateWithMargin = effectiveRate * (1 - state.traderMargin / 100);

  // Calculate margin loss amounts (what you lose to the trader margin)
  const marginLossNet =
    state.traderMargin > 0
      ? calculation.netAnnual * effectiveRate - convertedNet
      : 0;
  const marginLossGross =
    state.traderMargin > 0
      ? calculation.grossAnnual * effectiveRate - convertedGross
      : 0;

  // Period breakdowns (based on primary display - net if taxes shown, gross otherwise)
  const primaryAnnual = state.showTaxEstimate
    ? calculation.netAnnual
    : calculation.grossAnnual;
  const primaryConverted = state.showTaxEstimate
    ? convertedNet
    : convertedGross;
  const billableDays = calculation.billableHours / state.hoursPerDay;

  const monthly = primaryAnnual / 12;
  const biweekly = primaryAnnual / 26;
  const daily = primaryAnnual / billableDays;

  const monthlyConverted = primaryConverted / 12;
  const biweeklyConverted = primaryConverted / 26;
  const dailyConverted = primaryConverted / billableDays;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:items-start">
      {/* Left Column - Inputs + Settings */}
      <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
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
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
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
                <h2 className="font-medium">{state.title || "Untitled"}</h2>
                <button
                  onClick={() => {
                    setTitleInput(state.title);
                    setEditingTitle(true);
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

        {/* Employment Type Selector */}
        <div className="space-y-2" data-tour="employment-type">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">I am a</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>
                    This determines how taxes are calculated. Contractors pay
                    self-employment tax (CPP/EI in Canada, Social
                    Security/Medicare in US).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EMPLOYMENT_TYPES.map((type) => {
              const isContractor = type.value.startsWith("contractor");
              const isSelected = state.employmentType === type.value;
              return (
                <TooltipProvider key={type.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleEmploymentTypeChange(type.value)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 hover:bg-muted border-transparent"
                        } ${isContractor ? "" : "ml-2 first:ml-0"}`}
                      >
                        <span className="hidden sm:inline">{type.label}</span>
                        <span className="sm:hidden">
                          {isContractor ? "📝" : "🏢"} {type.shortLabel}
                        </span>
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

        {/* Rate/Salary Input */}
        <div className="flex gap-3 items-end" data-tour="rate-input">
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="mainInput"
              className="text-sm text-muted-foreground"
            >
              {state.employmentType === "contractor-retainer"
                ? "Monthly Retainer"
                : state.employmentType === "employee-salary"
                  ? "Annual Salary"
                  : "Hourly Rate"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                $
              </span>
              <Input
                id="mainInput"
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
                  }
                }}
                className="pl-8 text-xl font-medium h-11 tabular-nums border-0 border-b-2 border-muted rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors"
              />
              {state.employmentType === "contractor-retainer" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  /month
                </span>
              )}
              {state.employmentType === "employee-salary" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  /year
                </span>
              )}
            </div>
          </div>
          <Select
            value={state.currency}
            onValueChange={(v) => updateState({ currency: v as Currency })}
          >
            <SelectTrigger
              className="w-auto h-11 px-3 rounded-full border-2 hover:border-muted-foreground/50 transition-colors"
              aria-label="Select currency"
              data-tour="currency-select"
            >
              <SelectValue>
                <span className="text-base mr-1">
                  {CURRENCY_FLAGS[state.currency]}
                </span>
                <span className="font-medium text-sm">{state.currency}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <span className="text-lg mr-2">
                    {CURRENCY_FLAGS[c.value]}
                  </span>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hours Range for Retainer Mode */}
        {state.employmentType === "contractor-retainer" && (
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              Expected hours
            </Label>
            <div className="flex items-center gap-2">
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
                className="w-16 h-9 text-center"
              />
              <span className="text-muted-foreground">to</span>
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
                className="w-16 h-9 text-center"
              />
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            {state.monthlyRetainer > 0 && state.expectedHoursMin > 0 && (
              <span className="text-sm text-muted-foreground">
                = ${Math.round(state.monthlyRetainer / state.expectedHoursMax)}
                -${Math.round(state.monthlyRetainer / state.expectedHoursMin)}
                /hr
              </span>
            )}
          </div>
        )}

        {/* Settings Panel - within same column */}
        <div className="flex justify-end mb-2 lg:mb-3">
          <button
            onClick={toggleAllSections}
            className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors"
          >
            {allExpanded || openSection === "all"
              ? "Collapse all"
              : "Expand all settings"}
          </button>
        </div>
        <div
          className="rounded-lg border bg-card/50 backdrop-blur-sm overflow-hidden"
          data-tour="settings-panel"
        >
          {/* Currency Settings */}
          <Collapsible
            open={openSection === "currency" || openSection === "all"}
            onOpenChange={() => toggleSection("currency")}
          >
            <CollapsibleTrigger
              className={`flex items-center justify-between w-full px-3 py-2.5 lg:px-4 lg:py-3 hover:bg-muted/50 transition-all text-base ${openSection === "currency" || openSection === "all" ? "border-l-2 border-l-emerald-500" : "border-l-2 border-l-transparent"}`}
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${openSection === "currency" || openSection === "all" ? "rotate-90" : ""}`}
                />
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                <span>Currency Settings</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {state.showCurrencyConversion
                  ? `${CURRENCY_FLAGS[displayCurrency]} ${displayCurrency} · ${state.traderMargin}%`
                  : "Disabled"}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-3 pb-3 lg:px-4 lg:pt-4 lg:pb-4 space-y-3 lg:space-y-4">
              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="showConversion" className="text-base">
                  Show currency conversion
                </Label>
                <Switch
                  id="showConversion"
                  checked={state.showCurrencyConversion}
                  onCheckedChange={(checked) =>
                    updateState({ showCurrencyConversion: checked })
                  }
                />
              </div>

              {state.showCurrencyConversion && (
                <>
                  {/* Display Currency Selector */}
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Display Currency
                    </Label>
                    <Select
                      value={displayCurrency}
                      onValueChange={(v) =>
                        updateState({ displayCurrency: v as Currency })
                      }
                    >
                      <SelectTrigger className="h-10 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.filter(
                          (c) => c.value !== state.currency,
                        ).map((c) => (
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
                      <Label className="text-sm text-muted-foreground">
                        Conversion Margin
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>
                              Fee cushion for payment processing, currency
                              conversion, or client payment delays. Contractors
                              typically add 2-5%.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Preset Chips */}
                    <div className="flex flex-wrap gap-2">
                      {MARGIN_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() =>
                            updateState({ traderMargin: preset.value })
                          }
                          className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
                            state.traderMargin === preset.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/50 hover:bg-muted border-transparent"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
                          !MARGIN_PRESETS.some(
                            (p) => p.value === state.traderMargin,
                          )
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 hover:bg-muted border-transparent"
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {/* Slider */}
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[state.traderMargin]}
                        onValueChange={([value]) =>
                          updateState({ traderMargin: value })
                        }
                        max={10}
                        step={0.5}
                        className="flex-1"
                      />
                      <span className="text-base font-medium tabular-nums w-12 text-right">
                        {state.traderMargin}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Work Schedule - Consolidated */}
          <Collapsible
            open={openSection === "schedule" || openSection === "all"}
            onOpenChange={() => toggleSection("schedule")}
          >
            <CollapsibleTrigger
              className={`flex items-center justify-between w-full px-3 py-2.5 lg:px-4 lg:py-3 hover:bg-muted/50 transition-all text-base ${openSection === "schedule" || openSection === "all" ? "border-l-2 border-l-emerald-500" : "border-l-2 border-l-transparent"}`}
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${openSection === "schedule" || openSection === "all" ? "rotate-90" : ""}`}
                />
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Work Schedule</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentCountry?.flag} {state.region} ·{" "}
                {state.holidaysPerYear +
                  (state.unlimitedPTO
                    ? 0
                    : state.ptoDays + state.sickDays)}{" "}
                days off
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-3 pb-3 lg:px-4 lg:pt-4 lg:pb-4 space-y-4 lg:space-y-5">
              {/* Location Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    Country
                  </Label>
                  <Select
                    value={state.country}
                    onValueChange={handleCountryChange}
                  >
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
                  <Label className="text-sm text-muted-foreground">
                    Region
                  </Label>
                  <Select
                    value={state.region}
                    onValueChange={handleRegionChange}
                  >
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
                  <Label className="text-sm text-muted-foreground">
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
                    value={state.ptoDays || ""}
                    onChange={(e) =>
                      updateState({ ptoDays: parseInt(e.target.value) || 0 })
                    }
                    className="h-10 text-base"
                    disabled={state.unlimitedPTO}
                  />
                  <span className="text-xs text-muted-foreground">
                    vacation
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    Sick Days
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={state.sickDays || ""}
                    onChange={(e) =>
                      updateState({ sickDays: parseInt(e.target.value) || 0 })
                    }
                    className="h-10 text-base"
                    disabled={state.unlimitedPTO}
                  />
                  <span className="text-xs text-muted-foreground">
                    personal
                  </span>
                </div>
              </div>

              {/* Paid PTO Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="unlimitedPTO" className="text-base">
                  Employer provides paid time off
                </Label>
                <Switch
                  id="unlimitedPTO"
                  checked={state.unlimitedPTO}
                  onCheckedChange={(checked) =>
                    updateState({ unlimitedPTO: checked })
                  }
                />
              </div>

              {/* Hours Per Week */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    Hours/Day
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
                    className="h-10 text-base"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    Days/Week
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
          <Collapsible
            open={openSection === "tax" || openSection === "all"}
            onOpenChange={() => toggleSection("tax")}
          >
            <CollapsibleTrigger
              className={`flex items-center justify-between w-full px-3 py-2.5 lg:px-4 lg:py-3 hover:bg-muted/50 transition-all text-base ${openSection === "tax" || openSection === "all" ? "border-l-2 border-l-emerald-500" : "border-l-2 border-l-transparent"}`}
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${openSection === "tax" || openSection === "all" ? "rotate-90" : ""}`}
                />
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span>Taxes</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {state.showTaxEstimate
                  ? formatPercent(calculation.taxBreakdown.effectiveRate)
                  : "Off"}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-3 pb-3 lg:px-4 lg:pt-4 lg:pb-4 space-y-2 lg:space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="showTax" className="text-base">
                  Show tax estimate
                </Label>
                <Switch
                  id="showTax"
                  checked={state.showTaxEstimate}
                  onCheckedChange={(checked) =>
                    updateState({ showTaxEstimate: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="selfEmployed"
                    className="text-base text-muted-foreground"
                  >
                    Self-employed
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>
                          Controlled by employment type above. Contractors pay
                          self-employment tax (~15.3% in US, CPP in Canada).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {state.isSelfEmployed ? "Yes" : "No"}
                  </span>
                  <Switch
                    id="selfEmployed"
                    checked={state.isSelfEmployed}
                    disabled
                    className="opacity-50"
                  />
                </div>
              </div>
              {state.showTaxEstimate && (
                <div className="space-y-1 text-base pt-1 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Federal</span>
                    <span>
                      {formatCurrency(
                        calculation.taxBreakdown.federal,
                        state.currency,
                        { showCode: false },
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {state.country === "CA" ? "Provincial" : "State"}
                    </span>
                    <span>
                      {formatCurrency(
                        calculation.taxBreakdown.provincialState,
                        state.currency,
                        { showCode: false },
                      )}
                    </span>
                  </div>
                  {state.isSelfEmployed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {state.country === "CA" ? "CPP" : "Self-Emp"}
                      </span>
                      <span>
                        {formatCurrency(
                          calculation.taxBreakdown.selfEmployment,
                          state.currency,
                          { showCode: false },
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Total</span>
                    <span>
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
        </div>
      </div>

      {/* Right Column - Results (shows first on mobile) */}
      <div className="lg:sticky lg:top-4 lg:self-start space-y-3 lg:space-y-4 order-1 lg:order-2">
        {/* Results Card - Row-based Layout */}
        <Card
          className="relative overflow-hidden border-0 shadow-xl shadow-black/5 hover:shadow-2xl transition-shadow duration-300"
          data-tour="result-card"
        >
          {/* Gradient accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardContent className="p-4 sm:p-5 lg:p-6 pt-5 sm:pt-6 lg:pt-7 space-y-4 lg:space-y-5">
            {/* Currency Headers Row - hidden on mobile since flags show inline */}
            {state.showCurrencyConversion &&
            state.currency !== displayCurrency ? (
              <div className="hidden sm:grid grid-cols-2 gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">
                    {CURRENCY_FLAGS[state.currency]}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {state.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">
                      {CURRENCY_FLAGS[displayCurrency]}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {displayCurrency}
                    </span>
                    {state.traderMargin > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0 h-5 cursor-help"
                            >
                              −{state.traderMargin}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Forex margin: ~
                              {formatCurrency(marginLossNet, displayCurrency, {
                                showCode: false,
                              })}{" "}
                              lost annually
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Select
                    value={displayCurrency}
                    onValueChange={(v) =>
                      updateState({ displayCurrency: v as Currency })
                    }
                  >
                    <SelectTrigger
                      className="w-20 h-7 text-xs px-2"
                      aria-label="Select display currency"
                    >
                      <SelectValue>{displayCurrency}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.filter((c) => c.value !== state.currency).map(
                        (c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {CURRENCY_FLAGS[c.value]} {c.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-lg">
                  {CURRENCY_FLAGS[state.currency]}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {state.currency}
                </span>
              </div>
            )}

            {/* Results Rows */}
            {state.calculationMode === "hourlyToSalary" ? (
              <div className="space-y-3">
                {/* Take-home / Net Row (Hero) */}
                {state.showTaxEstimate && (
                  <div className="py-2 border-b border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Take-home
                    </p>
                    <div
                      className={`grid ${state.showCurrencyConversion && state.currency !== displayCurrency ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-1 sm:gap-4`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground sm:hidden">
                          {CURRENCY_FLAGS[state.currency]}
                        </span>
                        <p className="text-3xl sm:text-4xl font-bold tracking-tight leading-none text-green-600 dark:text-green-400 tabular-nums">
                          <AnimatedNumber
                            value={calculation.netAnnual}
                            formatter={(n) =>
                              formatCurrency(n, state.currency, {
                                showCode: false,
                              })
                            }
                          />
                        </p>
                      </div>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-muted-foreground sm:hidden">
                              {CURRENCY_FLAGS[displayCurrency]}
                            </span>
                            <div>
                              <p className="text-2xl sm:text-4xl font-bold tracking-tight leading-none text-green-700 dark:text-green-400 tabular-nums">
                                {formatCurrency(convertedNet, displayCurrency, {
                                  showCode: false,
                                })}
                              </p>
                              {state.traderMargin > 0 && marginLossNet > 0 && (
                                <p className="text-xs sm:text-sm text-red-500 tabular-nums mt-0.5">
                                  −
                                  {formatCurrency(
                                    marginLossNet,
                                    displayCurrency,
                                    { showCode: false },
                                  )}{" "}
                                  margin
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Gross Row */}
                <div className="py-2 border-b border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {state.showTaxEstimate ? "Gross" : "Annual"}
                  </p>
                  <div
                    className={`grid ${state.showCurrencyConversion && state.currency !== displayCurrency ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-1 sm:gap-4`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground sm:hidden">
                        {CURRENCY_FLAGS[state.currency]}
                      </span>
                      <p
                        className={`${state.showTaxEstimate ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"} font-bold tracking-tight leading-none tabular-nums`}
                      >
                        <AnimatedNumber
                          value={calculation.grossAnnual}
                          formatter={(n) =>
                            formatCurrency(n, state.currency, {
                              showCode: false,
                            })
                          }
                        />
                      </p>
                    </div>
                    {state.showCurrencyConversion &&
                      state.currency !== displayCurrency && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-muted-foreground sm:hidden">
                            {CURRENCY_FLAGS[displayCurrency]}
                          </span>
                          <div>
                            <p
                              className={`${state.showTaxEstimate ? "text-lg sm:text-2xl" : "text-2xl sm:text-4xl"} font-bold tracking-tight leading-none tabular-nums`}
                            >
                              {formatCurrency(convertedGross, displayCurrency, {
                                showCode: false,
                              })}
                            </p>
                            {!state.showTaxEstimate &&
                              state.traderMargin > 0 &&
                              marginLossGross > 0 && (
                                <p className="text-xs sm:text-sm text-red-500 tabular-nums mt-0.5">
                                  −
                                  {formatCurrency(
                                    marginLossGross,
                                    displayCurrency,
                                    { showCode: false },
                                  )}{" "}
                                  margin
                                </p>
                              )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Period Breakdowns */}
                <div className="pt-2 border-t border-border/30 space-y-1.5 sm:space-y-2 lg:space-y-3">
                  {/* Monthly */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Monthly
                    </span>
                    <div
                      className={`text-right ${state.showCurrencyConversion && state.currency !== displayCurrency ? "flex flex-col sm:flex-row sm:gap-3" : ""}`}
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums">
                        {formatCurrency(monthly, state.currency, {
                          showCode: false,
                        })}
                      </span>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(monthlyConverted, displayCurrency, {
                              showCode: false,
                            })}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Bi-weekly */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Bi-weekly
                    </span>
                    <div
                      className={`text-right ${state.showCurrencyConversion && state.currency !== displayCurrency ? "flex flex-col sm:flex-row sm:gap-3" : ""}`}
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums">
                        {formatCurrency(biweekly, state.currency, {
                          showCode: false,
                        })}
                      </span>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(
                              biweeklyConverted,
                              displayCurrency,
                              { showCode: false },
                            )}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Daily */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Daily
                    </span>
                    <div
                      className={`text-right ${state.showCurrencyConversion && state.currency !== displayCurrency ? "flex flex-col sm:flex-row sm:gap-3" : ""}`}
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums">
                        {formatCurrency(daily, state.currency, {
                          showCode: false,
                        })}
                      </span>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(dailyConverted, displayCurrency, {
                              showCode: false,
                            })}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Hourly */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Hourly
                    </span>
                    <div
                      className={`text-right ${state.showCurrencyConversion && state.currency !== displayCurrency ? "flex flex-col sm:flex-row sm:gap-3" : ""}`}
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums">
                        {formatCurrency(state.hourlyRate, state.currency, {
                          showCode: false,
                        })}
                      </span>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(
                              convertWithMargin(
                                state.hourlyRate,
                                state.currency,
                                displayCurrency,
                                state.traderMargin,
                              ),
                              displayCurrency,
                              { showCode: false },
                            )}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Salary to Hourly Mode */
              <div className="space-y-3">
                {/* Calculated Hourly Rate Row (Hero) */}
                <div className="py-2 border-b border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Hourly Rate
                  </p>
                  <div
                    className={`grid ${state.showCurrencyConversion && state.currency !== displayCurrency ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-1 sm:gap-4`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground sm:hidden">
                        {CURRENCY_FLAGS[state.currency]}
                      </span>
                      <p className="text-3xl sm:text-4xl font-bold tracking-tight leading-none tabular-nums">
                        {formatCurrency(
                          calculation.calculatedHourlyRate,
                          state.currency,
                          { showCode: false },
                        )}
                        /hr
                      </p>
                    </div>
                    {state.showCurrencyConversion &&
                      state.currency !== displayCurrency && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-muted-foreground sm:hidden">
                            {CURRENCY_FLAGS[displayCurrency]}
                          </span>
                          <p className="text-2xl sm:text-4xl font-bold tracking-tight leading-none tabular-nums">
                            {formatCurrency(convertedHourly, displayCurrency, {
                              showCode: false,
                            })}
                            /hr
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Gross Row */}
                <div className="py-2 border-b border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Gross Annual
                  </p>
                  <div
                    className={`grid ${state.showCurrencyConversion && state.currency !== displayCurrency ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-1 sm:gap-4`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground sm:hidden">
                        {CURRENCY_FLAGS[state.currency]}
                      </span>
                      <p className="text-xl sm:text-2xl font-bold tracking-tight leading-none tabular-nums">
                        {formatCurrency(
                          calculation.grossAnnual,
                          state.currency,
                          { showCode: false },
                        )}
                      </p>
                    </div>
                    {state.showCurrencyConversion &&
                      state.currency !== displayCurrency && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-muted-foreground sm:hidden">
                            {CURRENCY_FLAGS[displayCurrency]}
                          </span>
                          <p className="text-lg sm:text-2xl font-bold tracking-tight leading-none tabular-nums">
                            {formatCurrency(convertedGross, displayCurrency, {
                              showCode: false,
                            })}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Net Row */}
                {state.showTaxEstimate && (
                  <div className="py-2 border-b border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Take-home
                    </p>
                    <div
                      className={`grid ${state.showCurrencyConversion && state.currency !== displayCurrency ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-1 sm:gap-4`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground sm:hidden">
                          {CURRENCY_FLAGS[state.currency]}
                        </span>
                        <p className="text-xl sm:text-2xl font-bold tracking-tight leading-none text-green-600 dark:text-green-400 tabular-nums">
                          {formatCurrency(
                            calculation.netAnnual,
                            state.currency,
                            { showCode: false },
                          )}
                        </p>
                      </div>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-muted-foreground sm:hidden">
                              {CURRENCY_FLAGS[displayCurrency]}
                            </span>
                            <div>
                              <p className="text-lg sm:text-2xl font-bold tracking-tight leading-none text-green-700 dark:text-green-400 tabular-nums">
                                {formatCurrency(convertedNet, displayCurrency, {
                                  showCode: false,
                                })}
                              </p>
                              {state.traderMargin > 0 && marginLossNet > 0 && (
                                <p className="text-xs sm:text-sm text-red-500 tabular-nums mt-0.5">
                                  −
                                  {formatCurrency(
                                    marginLossNet,
                                    displayCurrency,
                                    { showCode: false },
                                  )}{" "}
                                  margin
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Period Breakdowns */}
                <div className="pt-2 border-t border-border/30 space-y-1.5 sm:space-y-2 lg:space-y-3">
                  {/* Monthly */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Monthly
                    </span>
                    <div
                      className={`text-right ${state.showCurrencyConversion && state.currency !== displayCurrency ? "flex flex-col sm:flex-row sm:gap-3" : ""}`}
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums">
                        {formatCurrency(monthly, state.currency, {
                          showCode: false,
                        })}
                      </span>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(monthlyConverted, displayCurrency, {
                              showCode: false,
                            })}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Bi-weekly */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Bi-weekly
                    </span>
                    <div
                      className={`text-right ${state.showCurrencyConversion && state.currency !== displayCurrency ? "flex flex-col sm:flex-row sm:gap-3" : ""}`}
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums">
                        {formatCurrency(biweekly, state.currency, {
                          showCode: false,
                        })}
                      </span>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(
                              biweeklyConverted,
                              displayCurrency,
                              { showCode: false },
                            )}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Daily */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Daily
                    </span>
                    <div
                      className={`text-right ${state.showCurrencyConversion && state.currency !== displayCurrency ? "flex flex-col sm:flex-row sm:gap-3" : ""}`}
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums">
                        {formatCurrency(daily, state.currency, {
                          showCode: false,
                        })}
                      </span>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(dailyConverted, displayCurrency, {
                              showCode: false,
                            })}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Hourly */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Hourly
                    </span>
                    <div
                      className={`text-right ${state.showCurrencyConversion && state.currency !== displayCurrency ? "flex flex-col sm:flex-row sm:gap-3" : ""}`}
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums">
                        {formatCurrency(
                          calculation.calculatedHourlyRate,
                          state.currency,
                          { showCode: false },
                        )}
                      </span>
                      {state.showCurrencyConversion &&
                        state.currency !== displayCurrency && (
                          <span className="text-xs sm:text-sm lg:text-base font-medium tabular-nums text-muted-foreground">
                            {formatCurrency(convertedHourly, displayCurrency, {
                              showCode: false,
                            })}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hours Summary */}
            <div className="text-sm text-muted-foreground text-center pt-1">
              {calculation.billableHours.toLocaleString()} hrs/year
            </div>
          </CardContent>

          {/* Exchange Rate Footer */}
          {exchangeRates &&
            state.showCurrencyConversion &&
            state.currency !== displayCurrency && (
              <div className="px-4 py-2 border-t bg-muted/5 flex items-center justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>
                    1 {state.currency} = {rateWithMargin.toFixed(4)}{" "}
                    {displayCurrency}
                    {state.traderMargin > 0 && (
                      <span className="opacity-60">
                        {" "}
                        (−{state.traderMargin}%)
                      </span>
                    )}
                  </span>
                  {error && (
                    <span
                      className="text-amber-500"
                      title="Using offline fallback rates"
                    >
                      (offline)
                    </span>
                  )}
                </div>
              </div>
            )}
        </Card>

        <div className="flex justify-end">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Copied!" : "Share calculation"}
          </button>
        </div>

        {/* Exchange Rate Display */}
        <ExchangeRateDisplay baseCurrency={state.currency} />
      </div>
    </div>
  );
}
