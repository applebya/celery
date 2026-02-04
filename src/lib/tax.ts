import {
  canadaTax,
  usTax,
  mexicoTax,
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
  country: "CA" | "US" | "MX",
  income: number,
): number {
  const config =
    country === "CA" ? canadaTax : country === "MX" ? mexicoTax : usTax;
  return calcBracketTax(income, config.federal);
}

/**
 * Calculate provincial (CA) or state (US) tax
 * Mexico has no state income tax on wages
 */
export function calcProvincialStateTax(
  country: "CA" | "US" | "MX",
  region: string,
  income: number,
): number {
  // Mexico states don't levy income tax on wages
  if (country === "MX") return 0;

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
 * Calculate self-employment taxes (CPP for Canada, SE tax for US, IMSS for Mexico)
 */
export function calcSelfEmploymentTax(
  country: "CA" | "US" | "MX",
  income: number,
): number {
  if (country === "CA") {
    return calcCanadaCPP(income);
  } else if (country === "MX") {
    return calcMexicoIMSS(income);
  } else {
    return calcUSSelfEmploymentTax(income);
  }
}

/**
 * Calculate Canada CPP contribution (both employer + employee portions)
 */
function calcCanadaCPP(income: number): number {
  const cpp = canadaTax.selfEmployment[0]; // CPP config
  const taxableIncome = Math.min(income, cpp.maxEarnings ?? income);
  return taxableIncome * cpp.rate;
}

/**
 * Calculate Mexico IMSS voluntary contribution for self-employed
 */
function calcMexicoIMSS(income: number): number {
  const imss = mexicoTax.selfEmployment[0];
  const taxableIncome = Math.min(income, imss.maxEarnings ?? income);
  return taxableIncome * imss.rate;
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
  country: "CA" | "US" | "MX",
  region: string,
  income: number,
  isSelfEmployed: boolean,
): number {
  const federalTax = calcFederalTax(country, income);
  const provincialStateTax = calcProvincialStateTax(country, region, income);
  const selfEmploymentTax = isSelfEmployed
    ? calcSelfEmploymentTax(country, income)
    : 0;

  return federalTax + provincialStateTax + selfEmploymentTax;
}

/**
 * Calculate effective tax rate
 */
export function calcEffectiveRate(
  country: "CA" | "US" | "MX",
  region: string,
  income: number,
  isSelfEmployed: boolean,
): number {
  if (income === 0) return 0;
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
  total: number;
  effectiveRate: number;
}

export function getTaxBreakdown(
  country: "CA" | "US" | "MX",
  region: string,
  income: number,
  isSelfEmployed: boolean,
): TaxBreakdown {
  const federal = calcFederalTax(country, income);
  const provincialState = calcProvincialStateTax(country, region, income);
  const selfEmployment = isSelfEmployed
    ? calcSelfEmploymentTax(country, income)
    : 0;
  const total = federal + provincialState + selfEmployment;
  const effectiveRate = income > 0 ? total / income : 0;

  return {
    federal,
    provincialState,
    selfEmployment,
    total,
    effectiveRate,
  };
}

/**
 * Get detailed bracket breakdown for federal taxes
 */
export function getFederalBracketDetails(
  country: "CA" | "US" | "MX",
  income: number,
): BracketDetail[] {
  const config =
    country === "CA" ? canadaTax : country === "MX" ? mexicoTax : usTax;
  return calcBracketTaxDetailed(income, config.federal);
}

/**
 * Get detailed bracket breakdown for provincial/state taxes
 * Mexico has no state income tax on wages
 */
export function getProvincialStateBracketDetails(
  country: "CA" | "US" | "MX",
  region: string,
  income: number,
): BracketDetail[] {
  // Mexico states don't levy income tax on wages
  if (country === "MX") return [];

  const config = country === "CA" ? canadaTax : usTax;
  const regions = country === "CA" ? config.provinces : config.states;

  if (!regions || !regions[region]) {
    return [];
  }

  return calcBracketTaxDetailed(income, regions[region]);
}
