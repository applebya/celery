# Employment Types, Corporation Structure & Comparison UX

> Design doc for Phase 5+ features

## Overview

Transform the calculator from a simple hourly↔salary converter into a proper contractor/employee income modeler with:
1. **Employment type selector** - Contractor vs Employee, hourly vs salary/retainer
2. **Corporation structure** - For contractors, model income through a corp with retention, dividends, and tax optimization
3. **Enhanced comparison** - Side-by-side scenarios with prominent delta display

---

## Part 1: Employment Type Selector

### Location
Directly below the rate input, replacing the "Switch to salary/rate" text button.

### Options (4 total)
| Type | Tax Treatment | Input | Time Off |
|------|--------------|-------|----------|
| Contractor (hourly) | Self-employed | $/hr | No paid PTO |
| Contractor (retainer) | Self-employed | $/month | Fixed monthly |
| Employee (hourly) | W-2/T4 | $/hr | Paid PTO applies |
| Employee (salary) | W-2/T4 | $/year | Paid PTO applies |

### UI
Segmented control / pill buttons - all options visible (not a dropdown).

```
┌─────────────────────────────────────────────────────────────┐
│  $ 75                                            🇨🇦 CAD    │
│  ════════════════════                                       │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐│
│  │ Contractor  │ │ Contractor  │ │  Employee   │ │Employee││
│  │  (hourly)   │ │ (retainer)  │ │  (hourly)   │ │(salary)││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Behavior
- Contractor types → auto-enable self-employment tax, show "Corporation" settings
- Employee types → auto-disable SE tax, hide corporation settings
- Tax panel SE toggle becomes read-only (controlled by employment type)

---

## Part 2: Corporation Structure

### When Shown
Only when Employment Type = Contractor (hourly or retainer)

### New State Fields
```typescript
interface CalculatorState {
  // ... existing fields

  employmentType: 'contractor-hourly' | 'contractor-retainer' | 'employee-hourly' | 'employee-salary'

  // Corporation settings (contractors only)
  isIncorporated: boolean
  corpRetentionPercent: number      // % of gross kept in corp (0-50)
  dividendVsSalaryPercent: number   // % of personal draw taken as dividend (0-100)

  // Rate overrides (optional)
  corpTaxRateOverride?: number      // Override province default
  dividendTaxRateOverride?: number  // Override calculated rate
}
```

### Money Flow Model

```
Gross Revenue
│
├─► Corp Retained (retention%)
│   ├─ Corp Tax (-)
│   └─ = Net in Corp
│
└─► Personal Draw (100 - retention%)
    ├─► As Salary (100 - dividend%)
    │   ├─ Income Tax (-)
    │   └─ = Net Salary
    │
    └─► As Dividend (dividend%)
        ├─ Dividend Tax (-)
        └─ = Net Dividend

═════════════════════════════════
Personal Take-home = Net Salary + Net Dividend
Corp Retained (after tax)
─────────────────────────────────
TOTAL NET = Personal + Corp
```

### Tax Rates (Canadian Defaults)

**Corporate Tax (Small Business Rate by Province):**
| Province | Combined Rate |
|----------|--------------|
| ON | 12.2% |
| BC | 11.0% |
| AB | 11.0% |
| QC | 12.2% |
| ... | (add all provinces) |

**Dividend Tax (Effective Rate):**
Non-eligible dividends from Canadian-controlled private corps (CCPC):
- Use effective rate after gross-up and credits
- Varies by province and income bracket
- Default: 35% (reasonable middle estimate)
- User can override

**Salary Tax:**
- Existing bracket-based calculation (already implemented)

### UI: Corporation Settings Panel

New collapsible section (only for contractors):

```
┌─ 🏢 Corporation ──────────────────────────────────────────┐
│                                                           │
│  Incorporated?                              [====○    ]   │
│                                                           │
│  ─── When ON: ───────────────────────────────────────     │
│                                                           │
│  Corp Retention        ════════════●══  20%               │
│  (keep in corp)                         $30,000/yr        │
│                                                           │
│  Personal Draw Split                                      │
│  Salary ════════●══════════════ Dividend                  │
│         40%                        60%                    │
│                                                           │
│  ─── Rates (customize) ──────────────────────────────     │
│  Corp tax: 12.2% (ON default)              [Edit]         │
│  Dividend tax: ~35% effective              [Edit]         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Results Card Display

Show breakdown with taxes as negative line items (like margin):

```
┌─────────────────────────────────────────────────────────┐
│  🇨🇦 CAD                                                 │
│                                                          │
│  PERSONAL                                                │
│  ─────────────────────────────────────────────────────   │
│  Take-home                              $96,000          │
│    Salary portion        $45,000                         │
│    Dividend portion      $51,000                         │
│    Income tax           -$15,000  ← red, like margin     │
│    Dividend tax          -$9,000                         │
│                                                          │
│  CORPORATION                                             │
│  ─────────────────────────────────────────────────────   │
│  Retained                               $26,400          │
│    Gross retained        $30,000                         │
│    Corp tax              -$3,600                         │
│                                                          │
│  ═══════════════════════════════════════════════════════ │
│  TOTAL NET WORTH                       $122,400          │
│  Effective tax rate                       18.4%          │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│  Monthly      $10,200 personal · $2,200 corp             │
│  Bi-weekly    $4,700 personal · $1,000 corp              │
└─────────────────────────────────────────────────────────┘
```

---

## Part 3: Enhanced Comparison View

### Layout: Side-by-Side Cards with Central Delta

```
┌─────────────────┐     ┌─────────────────┐
│   Scenario A    │     │   Scenario B    │
│   $75/hr · ON   │     │   $95k · BC     │
├─────────────────┤     ├─────────────────┤
│                 │     │                 │
│  Take-home      │     │  Take-home      │
│  $96,000        │     │  $72,000        │
│                 │ +$24k│                 │
│  Corp retained  │ ───►│  (no corp)      │
│  $26,400        │     │  —              │
│                 │     │                 │
│  Total net      │     │  Total net      │
│  $122,400       │+$50k│  $72,000        │
│                 │ ───►│                 │
│  Hours/yr       │     │  Hours/yr       │
│  1,880          │-120 │  2,000          │
│                 │ ◄───│                 │
└─────────────────┘     └─────────────────┘

        ┌─────────────────────────┐
        │      💡 VERDICT         │
        │                         │
        │  Scenario A nets $50k   │
        │  more with 120 fewer    │
        │  hours worked.          │
        │                         │
        │  Effective rate:        │
        │  $65/hr vs $36/hr       │
        └─────────────────────────┘
```

### Delta Display
- Shown in the gap between cards
- Color-coded: green = better, red = worse
- Animated when values change
- Shows both absolute ($24k) and relative (+33%)

### Mobile Layout
Stack vertically with delta row between:

```
┌─────────────────────┐
│   Scenario A        │
│   $122,400 total    │
└─────────────────────┘
        ↓ +$50,400 (+70%)
┌─────────────────────┐
│   Scenario B        │
│   $72,000 total     │
└─────────────────────┘
```

---

## Implementation Order

1. **Add employment type to state** - New field, migration for existing data
2. **Employment type selector UI** - Pill buttons below rate input
3. **Corporation settings panel** - New collapsible section
4. **Corporation tax calculations** - Extend tax.ts
5. **Results card corporation breakdown** - New display sections
6. **Comparison view redesign** - Side-by-side with delta column
7. **Mobile comparison layout** - Stacked with delta rows

---

## State Migration

Existing scenarios need defaults:
- `employmentType`: Infer from `isSelfEmployed` + `calculationMode`
- `isIncorporated`: false
- `corpRetentionPercent`: 20
- `dividendVsSalaryPercent`: 50

---

---

## Part 4: US S-Corp Support

### How S-Corps Differ from Canadian Corps

| Aspect | Canadian CCPC | US S-Corp |
|--------|--------------|-----------|
| Corporate tax | Yes (~11-15%) | No (pass-through) |
| Salary | Deductible, taxed as income | Same |
| Dividend/Distribution | Dividend tax w/ credits | No extra tax (already passed through) |
| SE Tax | On all self-emp income | Only on salary portion |
| Key optimization | Corp retention + dividend timing | "Reasonable salary" + distributions |

### S-Corp Money Flow

```
Gross Revenue
│
└─► All passes through to personal
    ├─► As "Reasonable Salary" (must be reasonable!)
    │   ├─ Income Tax (-)
    │   ├─ SE Tax (-15.3%) ← only on salary!
    │   └─ = Net Salary
    │
    └─► As Distribution (remainder)
        ├─ Income Tax (-) ← but NO SE tax
        └─ = Net Distribution

═════════════════════════════════
Total = Net Salary + Net Distribution
SE Tax savings = 15.3% × Distribution amount
```

### S-Corp UI Differences

- No "Corp retention %" (pass-through, no deferral)
- Slider becomes "Salary vs Distribution" split
- Show SE tax savings prominently
- Tooltip: "S-Corps require 'reasonable salary' - typically 40-60% of revenue for your role"

### Tooltip Assumptions (hover on ⓘ icons)

**Canadian CCPC:**
- "Small business deduction applies (first $500k active business income)"
- "Non-eligible dividends assumed (from small business)"
- "Dividend tax uses gross-up/credit approximation for your province"
- "Does not account for TOSI rules, passive income limits, or integration timing"

**US S-Corp:**
- "Pass-through entity - no corporate-level tax"
- "IRS requires 'reasonable compensation' - too-low salary risks audit"
- "Distributions avoid 15.3% SE tax (12.4% SS + 2.9% Medicare)"
- "Does not account for state-specific S-Corp rules or QBID"

---

## Part 5: Retainer Mode with Hours Range

### When
Employment type = "Contractor (retainer)"

### Input Fields

```
┌─────────────────────────────────────────────────────────────┐
│  Monthly Retainer                                           │
│  $ 12,000        /month                         🇨🇦 CAD     │
│  ════════════════════                                       │
│                                                             │
│  Expected Hours                                             │
│  ┌─────────┐  to  ┌─────────┐  /month                      │
│  │   120   │      │   160   │                              │
│  └─────────┘      └─────────┘                              │
│                                                             │
│  Effective rate: $75-100/hr                                │
└─────────────────────────────────────────────────────────────┘
```

### Calculations

- **Effective hourly (range):** $retainer / maxHours to $retainer / minHours
- **Annual:** $retainer × 12
- **Display both ends of range** in results when min ≠ max

### Results Display

```
┌─────────────────────────────────────────────────────────────┐
│  Effective Hourly Rate                                      │
│  $75 - $100 /hr                                            │
│  └─ based on 120-160 hrs/month                             │
│                                                             │
│  Annual Gross                                               │
│  $144,000                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tooltip Content Reference

All assumptions should be accessible via ⓘ hover tooltips:

### Employment Type Tooltips
- **Contractor (hourly):** "Self-employed, bill by the hour. You handle your own taxes, benefits, and time off."
- **Contractor (retainer):** "Fixed monthly fee regardless of hours. Common for ongoing client relationships."
- **Employee (hourly):** "W-2/T4 employee paid by the hour. Employer handles tax withholding."
- **Employee (salary):** "W-2/T4 employee with fixed annual salary. Employer handles tax withholding."

### Corporation Tooltips
- **Incorporated toggle:** "Operating through a corporation (CCPC in Canada, S-Corp/LLC in US) can provide tax advantages and liability protection."
- **Corp retention %:** "Money left in the corporation is taxed at lower small business rates. Can be used for business expenses, investments, or deferred personal income."
- **Dividend vs Salary:** "Salary is tax-deductible to the corp but subject to full income tax. Dividends have different tax treatment - optimize based on your bracket."
- **Corp tax rate:** "Small business rate for Canadian-controlled private corporations. Varies by province."
- **Dividend tax rate:** "Effective rate after dividend gross-up and tax credits. Non-eligible dividends from CCPCs."

### US S-Corp Tooltips
- **Salary vs Distribution:** "IRS requires 'reasonable compensation' as salary. Distributions avoid 15.3% self-employment tax but must not be excessive."
- **SE Tax savings:** "Self-employment tax (Social Security + Medicare) only applies to salary, not distributions. This is the main S-Corp tax benefit."
