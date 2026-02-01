# Architecture

**Analysis Date:** 2026-02-01

## Pattern Overview

**Overall:** Component-driven React calculator with functional hooks for state management and pure utility functions for business logic.

**Key Characteristics:**

- Unidirectional data flow from input components → calculation hooks → display components
- Client-side state persistence via localStorage with URL-based sharing
- Multi-scenario support with comparison mode
- Pure calculation logic decoupled from UI

## Layers

**Presentation Layer:**

- Purpose: Render UI components and handle user interactions
- Location: `src/components/`
- Contains: React functional components (Calculator, ComparisonView, etc.) using shadcn/ui and Radix primitives
- Depends on: Hooks, utilities, types, shadcn/ui
- Used by: Main App component orchestrates all UI

**Calculation/Business Logic Layer:**

- Purpose: Compute salary, tax, and financial breakdowns
- Location: `src/lib/calculate.ts`, `src/lib/tax.ts`
- Contains: Pure utility functions for financial calculations (no React)
- Depends on: Data sources (tax brackets)
- Used by: `useCalculation` hook

**State Management Layer:**

- Purpose: Manage application state (scenarios, calculations, theme, exchange rates)
- Location: `src/hooks/`
- Contains: Custom React hooks (useScenarios, useCalculation, useLocalStorage, useExchangeRate, useUrlState, useTheme)
- Depends on: Calculation layer, localStorage API, external APIs
- Used by: Presentation layer

**Data Sources:**

- Purpose: Provide static lookup data and external API integration
- Location: `src/data/`, API calls
- Contains: Tax brackets (`tax-brackets-2026.ts`), holidays (`holidays-2026.ts`), exchange rate API (Frankfurter)
- Used by: Calculation and hook layers

**Type Definitions:**

- Location: `src/types.ts`
- Contains: TypeScript interfaces and types (CalculatorState, SavedScenario, etc.)
- Used by: All layers

## Data Flow

**Single Scenario Workflow:**

1. User inputs hourly rate, region, work hours in `Calculator` component
2. `Calculator` calls `onChange` with new `CalculatorState`
3. App stores state in active scenario via `useScenarios` hook
4. `useCalculation` hook recomputes financial breakdown from state
5. `AnimatedNumber` components display results with animations
6. State persists to localStorage automatically

**Comparison Workflow:**

1. User enables comparison mode in `ComparisonView`
2. Left side shows active scenario (read-only in compare mode)
3. Right side loads second scenario from dropdown
4. Both scenarios pass through independent `useCalculation` hooks
5. Comparison rows compute deltas (difference, percentage change)
6. Victory badge highlights better scenario

**URL Sharing:**

1. `useUrlState` hook serializes state to URL query params
2. User clicks "Share" button
3. URL copied to clipboard
4. Recipient opens URL → params deserialize via `useUrlState`
5. State loads from URL, then persists to localStorage

**State Management:**

- **Scenarios Storage:** `localStorage['celery-scenarios']` holds array of `SavedScenario` objects
- **Active Scenario ID:** Tracked in `App` component state, passed through context
- **UI State:** Collapsible sections, comparison mode, theme preference stored in component state
- **Exchange Rates:** Cached in localStorage for 24 hours via Workbox service worker

## Key Abstractions

**CalculatorState:**

- Purpose: Single source of truth for all calculator inputs
- Defines: Hourly rate, tax country/region, work hours, employment type, tax settings, currency conversion
- Location: `src/types.ts`
- Usage: Passed between components, serialized to localStorage/URL, passed to calculation hooks

**CalculationResult:**

- Purpose: Output of all calculations, cached via `useMemo`
- Contains: billable hours, gross/net annual, tax breakdown, effective hourly rates, corporation breakdown
- Location: `src/hooks/useCalculation.ts`
- Pattern: Computed once per state change, reused across all display components

**SavedScenario:**

- Purpose: Container for persisted scenario data
- Contains: `id`, `name`, `state` (CalculatorState), timestamps
- Location: `src/types.ts`
- Usage: Array stored in localStorage, loaded into `useScenarios` hook

**TaxBreakdown:**

- Purpose: Detailed tax calculation for federal, provincial, self-employment
- Location: `src/lib/tax.ts`
- Pattern: Progressive bracket calculations, returns object with all tax components

**CorpBreakdown:**

- Purpose: Corporation tax optimization breakdown (for incorporated contractors)
- Location: `src/hooks/useCalculation.ts`
- Contains: Corp retained, corp tax, personal draw, salary/dividend split, net income
- Pattern: Only computed if `isIncorporated` flag is set

## Entry Points

**Application Entry:**

- Location: `src/main.tsx`
- Triggers: Browser loads index.html
- Responsibilities: Initialize React app, wrap with ErrorBoundary, init analytics

**Main App Component:**

- Location: `src/App.tsx`
- Triggers: React mounts after main.tsx
- Responsibilities: Manage scenarios, render header/footer, orchestrate ComparisonView

**Calculator Component:**

- Location: `src/components/Calculator.tsx`
- Triggers: Rendered by ComparisonView
- Responsibilities: Render all input controls, handle user input, manage local UI state (collapsible sections)

**ComparisonView Component:**

- Location: `src/components/ComparisonView.tsx`
- Triggers: Rendered by App
- Responsibilities: Toggle between single/comparison mode, render side-by-side calculations

## Error Handling

**Strategy:** Graceful degradation with ErrorBoundary at root

**Patterns:**

- **ErrorBoundary Component** (`src/components/ErrorBoundary.tsx`): Catches React render errors, displays fallback UI
- **Tax Data Gaps:** Functions return 0 if country/region not found (e.g., Mexico returns 0 taxes)
- **Exchange Rate Failures:** Graceful fallback if API unavailable, cache used if available
- **localStorage Failures:** Try/catch on load, start fresh if data corrupted
- **URL State Parsing:** Validates and defaults missing/malformed params instead of erroring

## Cross-Cutting Concerns

**Logging:**

- No persistent logging; uses `console` for development
- PostHog analytics (if enabled) tracks view events and comparison interactions

**Validation:**

- TypeScript strict mode catches type mismatches at build time
- `useCalculation` validates state before calculations
- No runtime schema validation (trusts TypeScript)

**Authentication:**

- None required (client-side only, no backend)

**Caching:**

- **Calculations:** `useMemo` in `useCalculation` hook prevents recalculation on render
- **Exchange Rates:** Service worker caches API responses (24-hour TTL)
- **Scenarios:** localStorage automatically persists after each state change
- **URL State:** Encodes state as compressed query params (not persistent, one-time use)

---

_Architecture analysis: 2026-02-01_
