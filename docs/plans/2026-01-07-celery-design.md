# Celery - Contractor Salary Calculator

**Design Date:** January 7, 2026
**Status:** Approved

## Overview

A lightweight, offline-first contractor salary calculator that converts hourly rate to annual compensation with tax estimates, currency conversion, and comparison mode.

**Target users:** Contractors in Canada and the US who need to quickly calculate annual take-home from hourly rates.

## Core Calculation

**Formula (top-down):**
```
Base hours = weeks_per_year × days_per_week × hours_per_day
Billable hours = Base hours - (holidays × hours_per_day) - (PTO × hours_per_day) - (sick_days × hours_per_day)
Gross annual = Billable hours × hourly_rate
Net annual = Gross annual - federal_tax - provincial_state_tax - self_employment_tax
```

**Defaults:**
- 52 weeks, 5 days/week, 8 hours/day (2080 base)
- Country/region-specific holiday presets
- 0 PTO, 0 sick days

## Holiday Presets (2026)

### Canada

| Province/Territory | Holidays | Notable |
|-------------------|----------|---------|
| Alberta | 9 | Family Day |
| British Columbia | 11 | BC Day, Truth & Reconciliation |
| Manitoba | 9 | Louis Riel Day |
| New Brunswick | 8 | NB Day |
| Newfoundland & Labrador | 6 | — |
| Nova Scotia | 6 | Heritage Day |
| Northwest Territories | 11 | Indigenous Peoples Day |
| Nunavut | 11 | Nunavut Day |
| Ontario | 9 | Boxing Day |
| Prince Edward Island | 8 | Islander Day |
| Quebec | 8 | St-Jean-Baptiste, Patriots' Day |
| Saskatchewan | 10 | Saskatchewan Day |
| Yukon | 11 | Discovery Day |

### United States

**Federal (all states):** 11 holidays

**State additions:**
- California: César Chávez Day, Day after Thanksgiving (12 total)
- Texas: Christmas Eve, Day after Christmas, Day after Thanksgiving (14 total)
- New York: Election Day, Lincoln's Birthday (13 total)
- Florida: Day after Thanksgiving (12 total)
- Good Friday states: CT, DE, HI, IN, KY, LA, NJ, NC, ND, TN (12 total)

## Tax Calculations (2026)

### Canada Federal

| Income | Rate |
|--------|------|
| $0 – $55,867 | 15% |
| $55,867 – $111,733 | 20.5% |
| $111,733 – $173,205 | 26% |
| $173,205 – $246,752 | 29% |
| $246,752+ | 33% |

### Canada Self-Employment

| Contribution | Rate | Max Earnings |
|--------------|------|--------------|
| CPP (both portions) | 11.9% | ~$68,500 |
| EI (optional) | 1.63% | ~$63,200 |

### US Federal (Single Filer)

| Income | Rate |
|--------|------|
| $0 – $11,925 | 10% |
| $11,925 – $48,475 | 12% |
| $48,475 – $103,350 | 22% |
| $103,350 – $197,300 | 24% |
| $197,300 – $250,525 | 32% |
| $250,525 – $626,350 | 35% |
| $626,350+ | 37% |

### US Self-Employment

| Tax | Rate | Notes |
|-----|------|-------|
| Self-employment | 15.3% | SS 12.4% + Medicare 2.9% |
| Applied to | 92.35% | Of net earnings |
| Additional Medicare | +0.9% | Over $200k |

**Disclaimer:** Estimates only. Assumes single filer, no deductions/credits. Consult a tax professional.

## UI Design

### Single Calculator View

```
┌─────────────────────────────────────────────┐
│  🥬 Celery                                  │
│  ─────────────────────────────────────────  │
│                                             │
│  Hourly Rate    [$___125___] [CAD ▼]        │
│                                             │
│  ═══════════════════════════════════════    │
│  📊 YOUR ANNUAL COMPENSATION                │
│     $243,750 CAD  →  $178,200 USD           │
│     (after tax: ~$168,500 CAD)              │
│     Rate as of Jan 7, 2026 • 1944 hrs/yr    │
│  ═══════════════════════════════════════    │
│                                             │
│  ▸ Location & Holidays        [🇨🇦 ON · 9]  │
│  ▸ Time Off                   [7 days]      │
│  ▸ Work Schedule              [40 hrs/wk]   │
│  ▸ Tax Estimate               [~31%]        │
│                                             │
│  ────────────────────────────────────────   │
│  💾 Preferences saved locally               │
└─────────────────────────────────────────────┘
```

### Comparison View

```
┌─────────────────────┬─────────────────────┐
│ [Old Job ✏️]        │ [New Offer ✏️]      │
├─────────────────────┼─────────────────────┤
│ $95/hr CAD          │ $125/hr CAD         │
│                     │                     │
│ $185,250/yr         │ $243,750/yr         │
│ ~$128,400 net       │ ~$168,500 net       │
│                     │                     │
│ 🇨🇦 ON · 9 holidays  │ 🇨🇦 ON · 9 holidays  │
│ 10 PTO · 40hr/wk    │ 7 PTO · 40hr/wk     │
├─────────────────────┴─────────────────────┤
│ 📈 Difference: +$40,100 net (+31%)        │
└───────────────────────────────────────────┘
```

**Mobile:** Stack vertically with tabs to switch.

## Data Model

```typescript
interface UserPreferences {
  hourlyRate: number
  currency: 'CAD' | 'USD'
  country: 'CA' | 'US'
  region: string              // 'ON', 'BC', 'CA', 'NY', etc.
  holidaysPerYear: number     // auto-set from region, adjustable
  ptoDays: number
  sickDays: number
  hoursPerDay: number         // default 8
  daysPerWeek: number         // default 5
  showTaxEstimate: boolean
  isSelfEmployed: boolean     // default true
}

interface ComparisonState {
  enabled: boolean
  leftTitle: string
  rightTitle: string
  left: UserPreferences
  right: UserPreferences
}
```

## Tech Stack

```
Vite + React 18 + TypeScript
├── Tailwind CSS
├── shadcn/ui
├── Bun (package manager)
├── vite-plugin-pwa (offline)
├── Plausible (analytics)
└── GitHub Pages (hosting)
```

## File Structure

```
src/
├── components/
│   ├── Calculator.tsx
│   ├── ComparisonView.tsx
│   ├── ModifierSection.tsx
│   └── ui/                   # shadcn
├── data/
│   ├── holidays-2026.json
│   └── tax-brackets-2026.json
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useExchangeRate.ts
│   └── useCalculation.ts
├── lib/
│   ├── calculate.ts
│   └── tax.ts
└── App.tsx
```

## Offline Strategy

| Data | Storage | Refresh |
|------|---------|---------|
| App shell | Service worker | On deploy |
| User prefs | localStorage | Every change |
| Exchange rate | localStorage | If >24h stale |
| Tax/holidays | Bundled JSON | Never (static) |

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// calculate.test.ts
- calcBillableHours(52, 5, 8, 9, 7, 0) → 1952
- calcGrossAnnual(125, 1944) → 243000

// tax.test.ts
- calcFederalTax('CA', 100000) → ~17,990
- calcProvincialTax('ON', 100000) → ~6,182
- calcSelfEmploymentTax('CA', 100000) → ~11,900
- calcSelfEmploymentTax('US', 100000) → ~14,130

// holidays.test.ts
- getHolidayCount('CA', 'ON') → 9
- getHolidayCount('CA', 'BC') → 11
- getHolidayCount('US', 'CA') → 12
```

### Component Tests

- Input changes update results
- Collapsible sections work
- localStorage persistence
- Comparison mode toggle

### E2E Tests (Playwright)

- Full user flow
- Offline functionality
- Exchange rate staleness

## Analytics (Plausible)

Track:
- Page views
- Feature usage (compare mode, tax toggle)
- Country/region selection

Do NOT track:
- Actual salary/rate inputs
- PII

## Out of Scope (v1)

- More than 2 comparison columns
- Historical tax years
- Currencies beyond CAD/USD
- User accounts / cloud sync
- Native mobile apps

## Sources

- [HR Covered - Canadian Holidays 2026](https://www.hrcovered.com/list-of-provincial-and-federal-statutory-holidays-2026/)
- [Statutory Holidays Canada](https://www.statutoryholidays.com/2026.php)
- [Office Holidays US](https://www.officeholidays.com/countries/usa/2026)
- [Canada Revenue Agency - Tax Rates](https://www.canada.ca/en/revenue-agency.html)
- [IRS - Tax Brackets](https://www.irs.gov/)
