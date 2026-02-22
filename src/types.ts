export type Currency =
  | "CAD"
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "NZD"
  | "CHF"
  | "JPY"
  | "INR"
  | "BRL"
  | "MXN"
  | "SGD"
  | "HKD"
  | "SEK"
  | "NOK"
  | "DKK"
  | "PLN"
  | "CZK"
  | "ILS"
  | "ZAR";

export type EmploymentType =
  | "contractor-hourly" // Self-employed, bill by the hour
  | "contractor-retainer" // Self-employed, fixed monthly fee
  | "employee-hourly" // W-2/T4 employee, paid by hour
  | "employee-salary"; // W-2/T4 employee, fixed salary

export interface CalculatorState {
  title: string;
  hourlyRate: number;
  currency: Currency;
  country: "CA" | "US" | "OTHER";
  region: string;
  holidaysPerYear: number;
  ptoDays: number;
  sickDays: number;
  hoursPerDay: number;
  daysPerWeek: number;
  showTaxEstimate: boolean;
  isSelfEmployed: boolean; // Derived from employmentType, kept for backwards compat
  // New: calculation mode (hourly → salary or salary → hourly)
  calculationMode: "hourlyToSalary" | "salaryToHourly";
  targetSalary: number;
  // Unlimited PTO: time off doesn't reduce billable hours (employer provides paid time off)
  unlimitedPTO: boolean;
  // Forex trader margin (percentage markup on exchange rates, e.g., 2 for 2%)
  traderMargin: number;
  // Secondary currency to display alongside primary
  displayCurrency: Currency;
  // Toggle to show/hide currency conversion column
  showCurrencyConversion: boolean;

  // Employment type (determines tax treatment and input mode)
  employmentType: EmploymentType;

  // Retainer mode fields
  monthlyRetainer: number; // Fixed monthly amount for contractor-retainer
  expectedHoursMin: number; // Min expected hours/month (for effective rate calc)
  expectedHoursMax: number; // Max expected hours/month (for effective rate range)

  // Fixed monthly hours (for contractors with negotiated monthly commitment)
  useFixedMonthlyHours: boolean;
  fixedMonthlyHours: number;

  // Extras (cash + equity)
  annualBonus: number;
  signOnBonus: number;
  signOnYears: number;
  stipendAnnual: number;
  employerMatchAnnual: number;
  equityMode: "annual" | "vesting";
  equityAnnualValue: number;
  equityGrantValue: number;
  equityVestYears: number;
  equityCliffMonths: number;
  extrasTaxTreatment: {
    bonus: "taxable" | "nonTaxable" | "nonCash";
    signOn: "taxable" | "nonTaxable" | "nonCash";
    stipend: "taxable" | "nonTaxable" | "nonCash";
    match: "taxable" | "nonTaxable" | "nonCash";
    equity: "nonCash";
  };
}

export interface ExchangeRates {
  rates: Record<Currency, number>; // All rates relative to USD
  timestamp: number;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  state: CalculatorState;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_STATE: CalculatorState = {
  title: "",
  hourlyRate: 25,
  currency: "CAD",
  country: "CA",
  region: "ON",
  holidaysPerYear: 9,
  ptoDays: 0,
  sickDays: 0,
  hoursPerDay: 8,
  daysPerWeek: 5,
  showTaxEstimate: true,
  isSelfEmployed: true,
  calculationMode: "hourlyToSalary",
  targetSalary: 150000,
  unlimitedPTO: false,
  traderMargin: 0,
  displayCurrency: "USD",
  showCurrencyConversion: true,
  // New employment type defaults
  employmentType: "contractor-hourly",
  // Retainer mode defaults
  monthlyRetainer: 10000,
  expectedHoursMin: 120,
  expectedHoursMax: 160,
  // Fixed monthly hours defaults
  useFixedMonthlyHours: false,
  fixedMonthlyHours: 160,
  // Extras defaults
  annualBonus: 0,
  signOnBonus: 0,
  signOnYears: 1,
  stipendAnnual: 0,
  employerMatchAnnual: 0,
  equityMode: "annual",
  equityAnnualValue: 0,
  equityGrantValue: 0,
  equityVestYears: 4,
  equityCliffMonths: 12,
  extrasTaxTreatment: {
    bonus: "taxable",
    signOn: "taxable",
    stipend: "nonTaxable",
    match: "nonCash",
    equity: "nonCash",
  },
};

// Helper to derive isSelfEmployed from employmentType
export function isSelfEmployedFromType(type: EmploymentType): boolean {
  return type === "contractor-hourly" || type === "contractor-retainer";
}

// Helper to check if contractor type
export function isContractorType(type: EmploymentType): boolean {
  return type === "contractor-hourly" || type === "contractor-retainer";
}
