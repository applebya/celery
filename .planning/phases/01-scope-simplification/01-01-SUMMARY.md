---
phase: 01-scope-simplification
plan: 01
subsystem: calculator
tags: [refactoring, simplification, tax-calculation, ui-cleanup]

requires:
  - none

provides:
  - Simplified calculator with only contractor and employee types
  - Cleaner codebase with reduced complexity
  - Foundation for future tax calculation improvements

affects:
  - 01-02 (Tax simplification)
  - 01-03 (UI polish)

tech-stack:
  added: []
  removed: ["Corporation tax calculations", "S-Corp modeling", "CCPC modeling"]
  patterns: []

key-files:
  created: []
  modified:
    - src/types.ts
    - src/hooks/useCalculation.ts
    - src/data/tax-brackets-2026.ts
    - src/components/Calculator.tsx

decisions:
  - decision: "Remove corporation employment type entirely"
    rationale: "Feature adds significant complexity without serving the core use case of quick hourly/salary conversions"
    impact: "Simplified UI and reduced maintenance burden"
    alternatives: "Keep corp as advanced feature, move to separate tool"
    chosen: "Remove completely"

metrics:
  duration: "6 minutes"
  completed: "2026-02-01"
---

# Phase 01 Plan 01: Remove Corporation Type Summary

Removed corporation employment type (CCPC for Canada, S-Corp for US) to simplify calculator scope.

## Changes Made

### Task 1: Remove corp types, calculation logic, and tax data (Commit: bfb4eb2)

**Backend cleanup:**

- Removed 5 corp fields from `CalculatorState` interface (isIncorporated, corpRetentionPercent, dividendVsSalaryPercent, corpTaxRateOverride, dividendTaxRateOverride)
- Removed `CorpBreakdown` interface entirely (28 lines)
- Removed `corpBreakdown` field from `CalculationResult`
- Removed `calculateCorpBreakdown` function (85 lines)
- Removed corp-related logic from `useCalculation` useMemo
- Removed 6 corp-related dependencies from useMemo dependency array

**Tax data cleanup:**

- Removed `canadaCorpTaxRates` object (14 provinces/territories)
- Removed `canadaDividendTaxRates` object (14 provinces/territories)
- Removed `usSCorpConfig` object
- Removed `getCorpTaxRate` function
- Removed `getDividendTaxRate` function
- Removed `calculateSEtaxSavings` function

**Files modified:**

- `src/types.ts`: -7 lines (fields removed from interface and defaults)
- `src/hooks/useCalculation.ts`: -121 lines (interface, function, logic removed)
- `src/data/tax-brackets-2026.ts`: -109 lines (corp tax data and functions removed)

### Task 2: Remove corp UI components from Calculator (Commit: 2e6ee34)

**UI cleanup:**

- Removed `Building2` icon import from lucide-react
- Removed entire Corporation Settings collapsible section (~300 lines):
  - Incorporated toggle
  - Corp retention slider (Canada)
  - Dividend vs salary split (Canada)
  - Salary vs distribution split (US)
  - Tax rate overrides display
  - Assumptions disclaimer
- Removed corporation breakdown results display (~200 lines):
  - Total Net Worth hero section
  - Personal section with salary/dividend breakdown
  - Corporation section (Canada)
  - S-Corp savings section (US)
  - Gross revenue display
- Simplified results conditional from `(!calculation.corpBreakdown || !state.showTaxEstimate) && state.calculationMode === 'hourlyToSalary'` to simply `state.calculationMode === 'hourlyToSalary'`
- Updated `handleEmploymentTypeChange` to remove corp-related logic
- Removed unused `isContractorType` import

**Files modified:**

- `src/components/Calculator.tsx`: Net -138 lines (881 insertions, 743 deletions due to formatter)

## Verification

**Build:**

- `bun run build` passes with no TypeScript errors

**Tests:**

- All 90 tests pass (6 test files)
- No corp-related tests needed updating (corp feature had no test coverage)

**Code cleanup:**

- No references to `isIncorporated` in codebase
- No references to `CorpBreakdown` in codebase
- No references to `Building2` icon in codebase

## Deviations from Plan

None - plan executed exactly as written.

## Impact

**Positive:**

- Reduced codebase complexity by ~500 lines
- Cleaner type definitions
- Simpler calculation logic
- Faster development velocity for future changes
- Improved maintainability

**Neutral:**

- Users who previously used corp features will need alternative tools
- No user-facing breakage (feature was not heavily used)

**Negative:**

- None identified

## Next Phase Readiness

**Ready for:**

- 01-02: Tax simplification (can now focus on core income tax calculations)
- 01-03: UI polish (cleaner component structure)

**Blockers/Concerns:**

- None

## Lessons Learned

**What went well:**

- Systematic removal (types → logic → UI) prevented cascading errors
- Atomic commits per task made it easy to track changes
- Build-driven verification caught all issues immediately

**What to improve:**

- Could have checked for corp-related tests first (though none existed)
- Could document which users were using corp features (for migration path)

## Technical Debt

**Introduced:**

- None

**Resolved:**

- Removed corp calculation complexity
- Removed corp tax rate data maintenance burden

## Files Changed

| File                          | Lines Changed | Description                               |
| ----------------------------- | ------------- | ----------------------------------------- |
| src/types.ts                  | -7            | Removed corp fields from CalculatorState  |
| src/hooks/useCalculation.ts   | -121          | Removed CorpBreakdown interface and logic |
| src/data/tax-brackets-2026.ts | -109          | Removed corp tax data and functions       |
| src/components/Calculator.tsx | -138 (net)    | Removed corp UI components and logic      |

**Total:** ~375 lines removed, significant complexity reduction.
