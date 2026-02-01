# Phase 1: Scope Simplification - Research

**Researched:** 2026-02-01
**Domain:** Code removal / refactoring (React + TypeScript)
**Confidence:** HIGH

## Summary

This phase is a **scope reduction task** (removing the corporation/incorporated feature), not a feature addition. The research focused on understanding the existing codebase to identify all locations where corporation-related code exists.

The corporation feature is well-isolated in the codebase, making removal straightforward. The feature spans three main areas: type definitions (`types.ts`), calculation logic (`useCalculation.ts` and `tax-brackets-2026.ts`), and UI components (`Calculator.tsx`). All references are self-contained and can be removed without affecting other functionality.

Notably, the URL state serialization (`useUrlState.ts`) does NOT include corporation fields, meaning there are no shareable URLs that will break from this change.

**Primary recommendation:** Systematically remove corporation-related code from types, calculation logic, and UI components in that order.

## Standard Stack

This phase uses the existing codebase stack - no new libraries required.

### Core

| Library    | Version     | Purpose      | Why Standard       |
| ---------- | ----------- | ------------ | ------------------ |
| React      | 19          | UI framework | Already in use     |
| TypeScript | Strict mode | Type safety  | Already configured |

### Supporting

No additional libraries needed for this removal task.

### Alternatives Considered

N/A - This is a removal task, not a feature addition.

**Installation:**

```bash
# No installation needed
```

## Architecture Patterns

### Code Removal Strategy (Recommended)

The removal should follow a **dependency order** to ensure TypeScript catches any missed references:

```
Order of changes:
1. types.ts               # Remove type definitions first
2. useCalculation.ts      # Remove calculation logic
3. tax-brackets-2026.ts   # Remove corp tax rates (keep as reference data, or remove)
4. Calculator.tsx         # Remove UI components
```

**What:** Remove code in reverse-dependency order
**When to use:** Any scope reduction refactoring
**Why:** TypeScript will flag any missed references when types are removed first

### Affected Files Summary

```
src/
├── types.ts                    # 5 fields to remove from CalculatorState
├── lib/
│   └── (tax.ts - no changes)   # Uses isSelfEmployed, not corporation
├── data/
│   └── tax-brackets-2026.ts    # Corp tax rates (keep or remove)
├── hooks/
│   ├── useCalculation.ts       # CorpBreakdown interface + calculateCorpBreakdown()
│   └── useUrlState.ts          # No changes needed (doesn't serialize corp fields)
└── components/
    └── Calculator.tsx          # ~200 lines of UI to remove
```

### Anti-Patterns to Avoid

- **Leaving dead code:** Don't comment out corporation code - remove it entirely
- **Partial removal:** Don't leave type definitions that are no longer used
- **Breaking type safety:** Don't use `any` to suppress TypeScript errors

## Don't Hand-Roll

This phase is about removal, not creation.

| Problem                    | Don't Build         | Use Instead                 | Why                                                      |
| -------------------------- | ------------------- | --------------------------- | -------------------------------------------------------- |
| Finding all references     | Manual search       | TypeScript compiler errors  | Compiler will catch missed references when types removed |
| Verifying removal complete | Manual testing only | `bun run build` + E2E tests | Build catches type errors, E2E catches runtime issues    |

**Key insight:** TypeScript's strict mode is the best tool for ensuring complete removal. Remove types first, then fix all resulting compile errors.

## Common Pitfalls

### Pitfall 1: Forgetting DEFAULT_STATE

**What goes wrong:** Remove type fields but forget to remove corresponding defaults
**Why it happens:** DEFAULT_STATE is in the same file but easy to miss
**How to avoid:** When removing from CalculatorState interface, also remove from DEFAULT_STATE
**Warning signs:** TypeScript errors about extra properties in DEFAULT_STATE

### Pitfall 2: Orphaned imports

**What goes wrong:** Remove code but leave unused imports (e.g., `Building2` icon)
**Why it happens:** ESLint may not catch all unused imports
**How to avoid:** Run `bun run lint` after removal and check for unused import warnings
**Warning signs:** Bundle size larger than expected after removal

### Pitfall 3: Breaking useMemo dependencies

**What goes wrong:** Remove state fields but forget to remove from useMemo dependency arrays
**Why it happens:** Dependency arrays are at bottom of hooks, easy to miss
**How to avoid:** Search for each field name when removing
**Warning signs:** Runtime warnings about missing dependencies (though removal shouldn't cause this)

### Pitfall 4: Conditional rendering orphans

**What goes wrong:** Remove `isIncorporated` state but leave `{condition && <Component />}` without updating
**Why it happens:** JSX conditionals can reference removed state
**How to avoid:** TypeScript will catch this - trust the compiler
**Warning signs:** Compile errors about missing properties

## Code Examples

### Removal Pattern: Type Definition

```typescript
// BEFORE (types.ts)
export interface CalculatorState {
  // ... other fields ...

  // Corporation structure (contractors only) -- REMOVE THIS SECTION
  isIncorporated: boolean;
  corpRetentionPercent: number;
  dividendVsSalaryPercent: number;
  corpTaxRateOverride?: number;
  dividendTaxRateOverride?: number;
}

// AFTER (types.ts)
export interface CalculatorState {
  // ... other fields ...
  // Corporation section completely removed
}
```

### Removal Pattern: DEFAULT_STATE

```typescript
// BEFORE
export const DEFAULT_STATE: CalculatorState = {
  // ... other defaults ...
  // Corporation defaults -- REMOVE THESE
  isIncorporated: false,
  corpRetentionPercent: 20,
  dividendVsSalaryPercent: 50,
};

// AFTER
export const DEFAULT_STATE: CalculatorState = {
  // ... other defaults ...
  // Corporation defaults removed
};
```

### Removal Pattern: useCalculation Hook

```typescript
// BEFORE
export interface CalculationResult {
  // ... other fields ...
  corpBreakdown: CorpBreakdown | null; // REMOVE
}

// Remove entire CorpBreakdown interface
// Remove calculateCorpBreakdown function
// Remove corp-related useMemo dependencies
```

### Removal Pattern: Calculator.tsx UI Section

```typescript
// BEFORE - Remove this entire section (~200 lines from line 655-860)
{/* Corporation Settings - Only for Contractors */}
{isContractorType(state.employmentType) && (
  <Collapsible open={openSection === 'corp' || openSection === 'all'}>
    {/* ... all corporation UI ... */}
  </Collapsible>
)}

// Also remove from results display (~100 lines from line 996-1100)
{calculation.corpBreakdown && state.showTaxEstimate && (
  // ... corporation breakdown display ...
)}
```

## State of the Art

| Old Approach                   | Current Approach   | When Changed | Impact                       |
| ------------------------------ | ------------------ | ------------ | ---------------------------- |
| Corporation as employment type | Removed from scope | This phase   | Simpler UI, fewer edge cases |

**Deprecated/outdated:**

- Corporation (CCPC/S-Corp) employment type: Being removed to simplify scope, focusing on income taxes rather than corporate structures

## Open Questions

None - this is a straightforward removal task with clear scope.

## Detailed Removal Checklist

### types.ts

- [ ] Remove `isIncorporated: boolean` from CalculatorState
- [ ] Remove `corpRetentionPercent: number` from CalculatorState
- [ ] Remove `dividendVsSalaryPercent: number` from CalculatorState
- [ ] Remove `corpTaxRateOverride?: number` from CalculatorState
- [ ] Remove `dividendTaxRateOverride?: number` from CalculatorState
- [ ] Remove same 5 fields from DEFAULT_STATE

### hooks/useCalculation.ts

- [ ] Remove `CorpBreakdown` interface (lines 8-35)
- [ ] Remove `corpBreakdown` from `CalculationResult` interface
- [ ] Remove `calculateCorpBreakdown` function (lines 149-234)
- [ ] Remove corp-related logic from main useMemo (lines 102-109)
- [ ] Remove corp-related dependencies from useMemo array (lines 138-142)
- [ ] Remove `getCorpTaxRate`, `getDividendTaxRate`, `calculateSEtaxSavings` imports

### data/tax-brackets-2026.ts (Optional)

- [ ] Consider removing `canadaCorpTaxRates` (lines 240-254) - or keep as reference data
- [ ] Consider removing `canadaDividendTaxRates` (lines 262-276)
- [ ] Consider removing `usSCorpConfig` (lines 284-295)
- [ ] Consider removing `getCorpTaxRate` function (lines 300-306)
- [ ] Consider removing `getDividendTaxRate` function (lines 311-318)
- [ ] Consider removing `calculateSEtaxSavings` function (lines 323-335)

**Note:** These tax rate functions are currently unused elsewhere. Recommend removal for cleanliness, but keeping won't break anything.

### components/Calculator.tsx

- [ ] Remove `Building2` icon import (line 2)
- [ ] Remove `getCorpTaxRate`, `getDividendTaxRate` imports (line 15)
- [ ] Remove Corporation Settings collapsible section (lines ~655-860)
- [ ] Remove corporation breakdown results display (lines ~996-1100)
- [ ] Update results conditional to remove `corpBreakdown` checks
- [ ] Clean up any remaining references

## Sources

### Primary (HIGH confidence)

- Direct codebase analysis via grep and file reading
- TypeScript type definitions in `src/types.ts`
- Existing calculation logic in `src/hooks/useCalculation.ts`

### Secondary (MEDIUM confidence)

N/A - All findings are from direct codebase analysis

### Tertiary (LOW confidence)

N/A

## Metadata

**Confidence breakdown:**

- Removal scope: HIGH - All references identified via grep search
- Impact assessment: HIGH - Feature is isolated, no external dependencies
- Test coverage: HIGH - E2E tests exist but don't cover corporation features

**Research date:** 2026-02-01
**Valid until:** Indefinite (removal scope is fixed)
