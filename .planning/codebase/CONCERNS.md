# Codebase Concerns

**Analysis Date:** 2026-02-01

## Tech Debt

**Manual Tax Bracket Updates:**

- Issue: Tax bracket data is hardcoded in `src/data/tax-brackets-2026.ts`. File needs manual annual updates for 2027+ tax years
- Files: `src/data/tax-brackets-2026.ts` (336 lines), `src/data/holidays-2026.ts` (150 lines)
- Impact: Calculator will provide incorrect tax estimates once 2026 ends. Users relying on outdated rates could make poor financial decisions
- Fix approach: Create a tax data migration pattern (e.g., `tax-brackets-2027.ts`) and add logic to detect when current year data should change. Consider building a tax bracket update workflow or linking to external CRA/IRS APIs in future

**Overgrown Calculator Component:**

- Issue: `src/components/Calculator.tsx` is 1,416 lines. Contains all input controls, results display, collapsible sections, and logic in a single monolithic component
- Files: `src/components/Calculator.tsx` (1,416 lines)
- Impact: Difficult to navigate, test, and maintain. Adding new features requires scrolling through massive file. Single responsibility principle violated
- Fix approach: Extract collapsible sections into sub-components (e.g., `ScheduleSection.tsx`, `CurrencySection.tsx`, `TaxSection.tsx`, `CorporationSection.tsx`). Extract results rendering into separate component. Move section state logic to custom hook

**Untested Data Files:**

- Issue: Tax bracket data (`src/data/tax-brackets-2026.ts`) and holiday data lack validation. No tests verify correct bracket ordering, non-overlapping ranges, or required fields
- Files: `src/data/tax-brackets-2026.ts`, `src/data/holidays-2026.ts`
- Impact: Silent calculation errors if tax brackets are malformed (e.g., overlapping ranges, missing max values). No safeguard against data entry mistakes during annual updates
- Fix approach: Add schema validation using Zod. Create integration tests that verify bracket integrity (non-overlapping, correct ordering, no gaps)

**Incomplete Test Coverage:**

- Issue: Core calculation hooks (`useCalculation.ts`, `useExchangeRate.ts`) and components lack unit tests. Only 4 test files exist covering basic utilities
- Files: `src/hooks/useCalculation.ts` (234 lines, zero tests), `src/hooks/useExchangeRate.ts` (220 lines, zero tests), `src/components/Calculator.tsx` (1,416 lines, zero tests)
- Impact: Corporation breakdown calculations (S-Corp/CCPC logic) untested. Exchange rate caching behavior untested. Complex conditional rendering untested. Regressions in core logic won't be caught
- Fix approach: Add vitest unit tests for `useCalculation` (test retainer mode, salary mode, corp breakdowns, all employment types). Add tests for `useExchangeRate` (cache behavior, fallback rates, historical data). Add component tests for major Calculator sections

**Silent Error Handling:**

- Issue: Error catching is vague. `Calculator.tsx` line 96-98: clipboard copy error silently fails with no user feedback. `useExchangeRate.ts` lines 45-47, 111-112: localStorage errors logged but not surfaced
- Files: `src/components/Calculator.tsx` (line 96), `src/hooks/useExchangeRate.ts` (lines 45, 111), `src/hooks/useLocalStorage.ts` (lines 19, 32)
- Impact: Users don't know if their data failed to save, or if share link was not copied. Makes debugging user-reported issues harder
- Fix approach: Add user-facing error notifications (toast/badge) for localStorage failures. Provide explicit feedback when clipboard copy fails

**Clipboard API Fallback Missing:**

- Issue: `Calculator.tsx` line 90-99: Clipboard API wrapped in try-catch but no fallback (no textarea, no manual copy). Silently fails for older browsers or permission-denied scenarios
- Files: `src/components/Calculator.tsx` (line 90-99)
- Impact: Share functionality breaks silently. Users with restrictive browser settings can't copy links. No alternative workflow
- Fix approach: Add clipboard fallback: if API fails, show a modal with URL in a readonly textarea user can manually copy from

---

## Performance Bottlenecks

**Expensive Exchange Rate Fetching:**

- Problem: `useExchangeRate.ts` fetches exchange rates on every component mount (line 154-156) without checking if it's already cached or running. No request deduplication
- Files: `src/hooks/useExchangeRate.ts` (line 154-156, 33-96)
- Cause: `fetchRates` called unconditionally on mount. Multiple Calculator instances (left + right in comparison mode) trigger duplicate fetches. Frankfurt API called even if rates cached within TTL
- Improvement path: Implement request deduplication using AbortController. Cache fetch promise, not just result. Use SWR-style pattern to prevent simultaneous requests

**Inefficient Comparison View Rendering:**

- Problem: ComparisonView renders two full Calculator instances side-by-side (mobile: one below other). Each has own hooks, exchange rate fetches, scenario logic
- Files: `src/components/ComparisonView.tsx` (538 lines), `src/components/Calculator.tsx` (1,416 lines × 2)
- Cause: No shared state/context between left and right calculators. Both fetch exchange rates independently
- Improvement path: Extract shared exchange rate data into context or parent state. Share single `ExchangeRates` object. Consider virtualizing mobile layout to avoid rendering both below the fold

**Unoptimized Re-renders:**

- Problem: Calculator component uses `useCallback` but dependency arrays are very large (line 121-143 in `useCalculation.ts`: 13 dependencies). State changes in unrelated fields still trigger memoized hook recalculation
- Files: `src/hooks/useCalculation.ts` (line 121-143), `src/components/Calculator.tsx` (multiple useCallback with long arrays)
- Cause: Granular state object means small changes invalidate memoization. No batching of related state
- Improvement path: Consider splitting CalculatorState into sub-objects (schedule, currency, tax, corp) to reduce dependency array size per hook

---

## Fragile Areas

**Corporation Breakdown Logic:**

- Files: `src/hooks/useCalculation.ts` (lines 149-234)
- Why fragile: Complex business logic with country-specific branching (US S-Corp vs Canadian CCPC). Dividend/salary split calculation uses approximations. No explicit comment about TOSI, integration timing, or edge cases. Code is correct but implicit
- Safe modification: Add detailed comments explaining assumptions (e.g., "US S-Corp: 15.3% SE tax avoided on distributions above reasonable salary"). Add unit tests for specific scenarios (e.g., $500k income split 50/50). Validate against real tax software before releasing changes
- Test coverage: Zero tests for corp breakdown logic. Must add comprehensive tests before further changes

**Exchange Rate Fallback Logic:**

- Files: `src/hooks/useExchangeRate.ts` (lines 18-25, 82-92)
- Why fragile: Fallback rates are hardcoded approximations from 2025. If markets shift significantly, fallback becomes misleading. No versioning or update mechanism. If Frankfurt API changes response shape, fallback doesn't update
- Safe modification: Add fallback rates to a separate data file with version/timestamp. Log fallback usage to PostHog to catch API failures. Add integration test that verifies Frankfurt API response shape matches code expectations
- Test coverage: No tests for fallback behavior or API response parsing

**Tax Bracket Lookups:**

- Files: `src/lib/tax.ts` (lines 36-55), `src/data/tax-brackets-2026.ts`
- Why fragile: Assumes brackets in `tax-brackets-2026.ts` have correct ordering and no gaps. No validation at initialization. If region key doesn't exist, returns 0 tax silently (line 45-46 in tax.ts)
- Safe modification: Add runtime validation of bracket arrays on app start. Use Zod schema. Throw error if region not found (fail-fast) instead of silent 0 return. Add debug logging showing which region was selected
- Test coverage: Unit tests exist for tax.ts but don't test all regions or edge income values

**Retainer Mode Calculations:**

- Files: `src/hooks/useCalculation.ts` (lines 70-78), `src/components/Calculator.tsx` (lines 374-402)
- Why fragile: Effective hourly range calculated as `(monthlyRetainer / maxHours)` to `(monthlyRetainer / minHours)`. Code assumes minHours < maxHours (inverted). If user enters expectedHoursMin > expectedHoursMax, display shows backwards range. No validation
- Safe modification: Add validation in state update handlers. Check expectedHoursMin <= expectedHoursMax. Swap them if reversed. Show validation error if either is 0
- Test coverage: No tests for retainer mode calculations

---

## Security Considerations

**Third-Party API Dependency:**

- Risk: Currency conversion relies entirely on Frankfurt API (`https://api.frankfurter.app`). No authentication, unvetted third party. If API is compromised, could inject incorrect rates
- Files: `src/hooks/useExchangeRate.ts` (line 55)
- Current mitigation: Fallback rates are hardcoded. If API fails/times out, app uses stale approximations instead of breaking
- Recommendations: Add rate validation (reject changes >10% from previous cached rate). Add error logging to PostHog to detect anomalies. Consider rate-limiting or caching at a CDN layer. Document API dependency in README

**localStorage Data Exposure:**

- Risk: All calculator state (including scenarios, exchange rates, historical data) stored in plain localStorage. No encryption. On shared devices, previous user's financial data (salary, hours, tax rates) readable
- Files: `src/hooks/useLocalStorage.ts`, `src/hooks/useScenarios.ts`, `src/hooks/useExchangeRate.ts`
- Current mitigation: None. Data persists across browser sessions
- Recommendations: Add privacy warning on load ("Your calculations are stored locally on this device"). Add "Clear all data" button in settings. Consider adding sessionStorage option for shared devices. Document data storage in privacy policy

**Exchange Rate Cache Poisoning:**

- Risk: Historical exchange rate cache in localStorage not validated. If attacker modifies cache, app displays wrong conversion rates
- Files: `src/hooks/useExchangeRate.ts` (lines 137-144)
- Current mitigation: None. Cache assumes valid JSON
- Recommendations: Add timestamp validation on cache load. Reject cache if >24 hours old. Add checksum/signature to cached rates (low-effort: hash of rates object)

---

## Missing Critical Features

**No Annual Tax Bracket Update Workflow:**

- Problem: When 2027 arrives, calculator becomes inaccurate. No mechanism to detect this or prompt users. Requires code change + redeploy
- Blocks: Users can't use calculator confidently after year-end. Becomes stale product

**No Error Tracking in Production:**

- Problem: ErrorBoundary exists but only logs to console in DEV. No production error reporting (Sentry/Rollbar). If corp breakdown calculation fails, user sees "Something went wrong" with no telemetry
- Blocks: Can't diagnose user-reported bugs without log access. Can't detect silent calculation failures

**No Validation of User Inputs:**

- Problem: No range checks on numeric inputs. User can enter negative hours, 1000+ PTO days, etc. Calculator will produce nonsensical results
- Blocks: Edge cases produce garbage output without warning

---

## Test Coverage Gaps

**Uninsured Tax Calculation Edge Cases:**

- What's not tested: Tax calculations for high income (>$500k), S-Corp distributions with low salary (<30%), dividend income on corp retained earnings, RRSP/RREG deductions, special tax credits
- Files: `src/lib/tax.ts` (169 lines), `src/hooks/useCalculation.ts` (234 lines)
- Risk: Silent miscalculations for high-earner use cases
- Priority: High - tax accuracy is core product promise

**No Integration Tests for Employment Type Changes:**

- What's not tested: Switching between contractor ↔ employee, toggling incorporation, changing country/region and ensuring dependent fields reset correctly
- Files: `src/components/Calculator.tsx` (lines 131-154), `src/types.ts`
- Risk: UI state desync from calculation logic
- Priority: Medium - used frequently but doesn't break core math

**No E2E Tests for Scenarios:**

- What's not tested: Creating, renaming, deleting, comparing scenarios. Scenario data persistence across page reloads
- Files: `src/hooks/useScenarios.ts` (176 lines), `e2e/` folder
- Risk: Scenario feature breaks silently
- Priority: Medium

**Exchange Rate Display Never Tested:**

- What's not tested: Fallback rate display, offline mode badge, margin loss calculations, multi-currency results formatting
- Files: `src/components/ExchangeRateDisplay.tsx` (182 lines), `src/hooks/useExchangeRate.ts` (220 lines)
- Risk: Currency features fail undetected
- Priority: Medium

---

## Dependencies at Risk

**External Exchange Rate API Dependency:**

- Risk: Frankfurt API (frankfurter.app) not guaranteed SLA. No official documentation of uptime/stability
- Impact: Currency conversion breaks if API down. Users get fallback rates from 2025
- Migration plan: Consider alternatives (ECB API directly, Fixer, XE). Pre-fetch rates during build and check into repo as seed data. Implement local cache-only mode

---

## Known Issues

**Clipboard Share URL May Fail Silently:**

- Symptoms: User clicks "Share calculation" button. No feedback. No URL copied to clipboard
- Files: `src/components/Calculator.tsx` (lines 90-99)
- Trigger: Browser without Clipboard API, permission denied, or under HTTP (non-localhost)
- Workaround: User manually copies URL from address bar

---

_Concerns audit: 2026-02-01_
