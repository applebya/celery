import {
  canadaTax,
  usTax,
  caFederalBpa,
  caProvincialBPA,
  usStandardDeductionSingle,
  CPP_BASIC_EXEMPTION,
  CPP_YMPE,
  CPP_YAMPE,
  CPP_RATE_BASE,
  CPP_RATE_ADDITIONAL,
  CPP2_RATE,
  EI_RATE,
  EI_MAX_INSURABLE,
  US_SOCIAL_SECURITY_RATE,
  US_SOCIAL_SECURITY_WAGE_BASE,
  US_MEDICARE_RATE,
  US_ADDITIONAL_MEDICARE_RATE,
  US_ADDITIONAL_MEDICARE_THRESHOLD,
  type TaxBracket,
} from "@/data/tax-brackets-2026";

/**
 * Individual bracket tax detail
 */
export interface BracketDetail {
  rate: number;
  min: number;
  max: number | null;
  taxableAmount: number;
  taxAmount: number;
}

/**
 * Calculate tax using progressive brackets
 */
export function calcBracketTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketSize = bracket.max ? bracket.max - bracket.min : Infinity;
    const taxableInBracket = Math.min(remainingIncome, bracketSize);
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
}

/**
 * Calculate taxable income (single filer assumption for US)
 */
export function calcTaxableIncome(
  country: "CA" | "US" | "OTHER",
  income: number,
): number {
  if (country === "OTHER") return 0;
  if (country === "US") {
    return Math.max(0, income - usStandardDeductionSingle);
  }
  // Canada: taxable income is gross (basic personal amount handled as credit)
  return Math.max(0, income);
}

/**
 * Calculate tax with bracket-by-bracket breakdown
 */
export function calcBracketTaxDetailed(
  income: number,
  brackets: TaxBracket[],
): BracketDetail[] {
  const details: BracketDetail[] = [];
  let remainingIncome = income;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketSize = bracket.max ? bracket.max - bracket.min : Infinity;
    const taxableInBracket = Math.min(remainingIncome, bracketSize);
    const taxAmount = taxableInBracket * bracket.rate;

    details.push({
      rate: bracket.rate,
      min: bracket.min,
      max: bracket.max,
      taxableAmount: taxableInBracket,
      taxAmount,
    });

    remainingIncome -= taxableInBracket;
  }

  return details;
}

/**
 * Calculate federal tax for a country
 */
export function calcFederalTax(
  country: "CA" | "US" | "OTHER",
  income: number,
): number {
  if (country === "OTHER") return 0;
  const config = country === "CA" ? canadaTax : usTax;
  return calcBracketTax(income, config.federal);
}

/**
 * Calculate provincial (CA) or state (US) tax
 */
export function calcProvincialStateTax(
  country: "CA" | "US" | "OTHER",
  region: string,
  income: number,
): number {
  if (country === "OTHER") return 0;

  const config = country === "CA" ? canadaTax : usTax;
  const regions = country === "CA" ? config.provinces : config.states;

  if (!regions || !regions[region]) {
    return 0;
  }

  const brackets = regions[region];
  if (brackets.length === 0) {
    return 0; // No income tax (e.g., Texas, Florida)
  }

  return calcBracketTax(income, brackets);
}

/**
 * Calculate employee payroll taxes (CPP/EI for CA, FICA for US)
 */
export function calcEmployeePayrollTax(
  country: "CA" | "US" | "OTHER",
  income: number,
): number {
  if (country === "OTHER") return 0;

  if (country === "US") {
    const ssEarnings = Math.min(income, US_SOCIAL_SECURITY_WAGE_BASE);
    const ssTax = ssEarnings * US_SOCIAL_SECURITY_RATE;
    const medicareTax = income * US_MEDICARE_RATE;
    const additionalMedicareTax =
      Math.max(0, income - US_ADDITIONAL_MEDICARE_THRESHOLD) *
      US_ADDITIONAL_MEDICARE_RATE;
    return ssTax + medicareTax + additionalMedicareTax;
  }

  // Canada (employee portion)
  const pensionableEarnings = Math.max(0, income - CPP_BASIC_EXEMPTION);
  const cppBaseEarnings = Math.min(pensionableEarnings, CPP_YMPE - CPP_BASIC_EXEMPTION);
  const cppBaseTax =
    cppBaseEarnings * (CPP_RATE_BASE + CPP_RATE_ADDITIONAL);

  const cpp2Earnings = Math.max(0, Math.min(income, CPP_YAMPE) - CPP_YMPE);
  const cpp2Tax = cpp2Earnings * CPP2_RATE;

  const eiEarnings = Math.min(income, EI_MAX_INSURABLE);
  const eiTax = eiEarnings * EI_RATE;

  return cppBaseTax + cpp2Tax + eiTax;
}

/**
 * Calculate self-employment taxes (CPP for Canada, SE tax for US)
 */
export function calcSelfEmploymentTax(
  country: "CA" | "US" | "OTHER",
  income: number,
): number {
  if (country === "OTHER") return 0;
  if (country === "CA") {
    return calcCanadaCPP(income);
  } else {
    return calcUSSelfEmploymentTax(income);
  }
}

/**
 * Calculate Canada CPP contribution (both employer + employee portions)
 */
function calcCanadaCPP(income: number): number {
  // Self-employed pays both employee + employer portions (base + additional)
  const pensionableEarnings = Math.max(0, income - CPP_BASIC_EXEMPTION);
  const cppBaseEarnings = Math.min(
    pensionableEarnings,
    CPP_YMPE - CPP_BASIC_EXEMPTION,
  );
  const cppBaseTax =
    cppBaseEarnings * 2 * (CPP_RATE_BASE + CPP_RATE_ADDITIONAL);

  const cpp2Earnings = Math.max(0, Math.min(income, CPP_YAMPE) - CPP_YMPE);
  const cpp2Tax = cpp2Earnings * 2 * CPP2_RATE;

  return cppBaseTax + cpp2Tax;
}

/**
 * Calculate US self-employment tax
 * - Applied to 92.35% of net self-employment earnings
 * - Social Security: 12.4% up to wage base
 * - Medicare: 2.9% on all earnings
 * - Additional Medicare: 0.9% on earnings over $200k
 */
function calcUSSelfEmploymentTax(income: number): number {
  const SE_RATE = 0.9235; // 92.35% of net earnings subject to SE tax
  const seEarnings = income * SE_RATE;

  const ssTax = usTax.selfEmployment[0]; // Social Security
  const medicareTax = usTax.selfEmployment[1]; // Medicare
  const additionalMedicare = usTax.selfEmployment[2]; // Additional Medicare

  // Social Security (capped)
  const ssEarnings = Math.min(seEarnings, ssTax.maxEarnings ?? seEarnings);
  const ssTaxAmount = ssEarnings * ssTax.rate;

  // Medicare (no cap)
  const medicareTaxAmount = seEarnings * medicareTax.rate;

  // Additional Medicare (on earnings over $200k)
  const additionalMedicareThreshold = 200000;
  const additionalMedicareEarnings = Math.max(
    0,
    income - additionalMedicareThreshold,
  );
  const additionalMedicareTaxAmount =
    additionalMedicareEarnings * additionalMedicare.rate;

  return ssTaxAmount + medicareTaxAmount + additionalMedicareTaxAmount;
}

/**
 * Calculate total tax (federal + provincial/state + self-employment)
 */
export function calcTotalTax(
  country: "CA" | "US" | "OTHER",
  region: string,
  income: number,
  isSelfEmployed: boolean,
): number {
  if (country === "OTHER") return 0;
  return getTaxBreakdown(country, region, income, isSelfEmployed).total;
}

/**
 * Calculate effective tax rate
 */
export function calcEffectiveRate(
  country: "CA" | "US" | "OTHER",
  region: string,
  income: number,
  isSelfEmployed: boolean,
): number {
  if (income === 0 || country === "OTHER") return 0;
  const totalTax = calcTotalTax(country, region, income, isSelfEmployed);
  return totalTax / income;
}

/**
 * Get tax breakdown for display
 */
export interface TaxBreakdown {
  federal: number;
  provincialState: number;
  selfEmployment: number;
  payroll: number;
  total: number;
  effectiveRate: number;
}

export function getTaxBreakdown(
  country: "CA" | "US" | "OTHER",
  region: string,
  income: number,
  isSelfEmployed: boolean,
): TaxBreakdown {
  if (country === "OTHER") {
    return {
      federal: 0,
      provincialState: 0,
      selfEmployment: 0,
      payroll: 0,
      total: 0,
      effectiveRate: 0,
    };
  }
  const taxableIncome = calcTaxableIncome(country, income);
  let federal = calcFederalTax(country, taxableIncome);
  let provincialState = calcProvincialStateTax(country, region, taxableIncome);

  // Canada basic personal amount credits (approximate - max amount)
  if (country === "CA") {
    const federalCredit = caFederalBpa.max * canadaTax.federal[0].rate;
    federal = Math.max(0, federal - federalCredit);

    const provincialBpa = caProvincialBPA[region] ?? 0;
    const provincialRate = canadaTax.provinces?.[region]?.[0]?.rate ?? 0;
    const provincialCredit = provincialBpa * provincialRate;
    provincialState = Math.max(0, provincialState - provincialCredit);
  }

  const selfEmployment = isSelfEmployed
    ? calcSelfEmploymentTax(country, income)
    : 0;
  const payroll = !isSelfEmployed
    ? calcEmployeePayrollTax(country, income)
    : 0;
  const total = federal + provincialState + selfEmployment + payroll;
  const effectiveRate = income > 0 ? total / income : 0;

  return {
    federal,
    provincialState,
    selfEmployment,
    payroll,
    total,
    effectiveRate,
  };
}

/**
 * Get detailed bracket breakdown for federal taxes
 */
export function getFederalBracketDetails(
  country: "CA" | "US" | "OTHER",
  income: number,
): BracketDetail[] {
  if (country === "OTHER") return [];
  const config = country === "CA" ? canadaTax : usTax;
  const taxableIncome =
    country === "US" ? calcTaxableIncome(country, income) : income;
  return calcBracketTaxDetailed(taxableIncome, config.federal);
}

/**
 * Get detailed bracket breakdown for provincial/state taxes
 */
export function getProvincialStateBracketDetails(
  country: "CA" | "US" | "OTHER",
  region: string,
  income: number,
): BracketDetail[] {
  if (country === "OTHER") return [];

  const config = country === "CA" ? canadaTax : usTax;
  const regions = country === "CA" ? config.provinces : config.states;

  if (!regions || !regions[region]) {
    return [];
  }

  const taxableIncome =
    country === "US" ? calcTaxableIncome(country, income) : income;
  return calcBracketTaxDetailed(taxableIncome, regions[region]);
}
