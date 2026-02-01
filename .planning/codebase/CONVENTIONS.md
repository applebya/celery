# Coding Conventions

**Analysis Date:** 2026-02-01

## Naming Patterns

**Files:**

- Component files: PascalCase (e.g., `Calculator.tsx`, `ComparisonView.tsx`)
- Hook files: camelCase with `use` prefix (e.g., `useScenarios.ts`, `useCalculation.ts`)
- Utility/library files: camelCase (e.g., `calculate.ts`, `tax.ts`, `analytics.ts`)
- Data files: camelCase with year suffix (e.g., `tax-brackets-2026.ts`, `holidays-2026.ts`)
- Test files: Same name as source with `.test.ts` or `.spec.ts` suffix (e.g., `calculate.test.ts`, `AnimatedNumber.test.tsx`)
- UI component files: camelCase in `ui/` directory (e.g., `button.tsx`, `input.tsx`, `card.tsx`)

**Functions:**

- camelCase for all functions
- Prefix utility functions with their purpose: `calc*` for calculations (e.g., `calcBaseHours`, `calcGrossAnnual`, `calcBillableHours`)
- Prefix generators: `generate*` (e.g., `generateId`, `generateScenarioName`)
- Prefix getters: `get*` (e.g., `getScenario`, `getCountry`, `getCorpTaxRate`)
- Hook functions: `use*` (e.g., `useScenarios`, `useCalculation`, `useLocalStorage`)
- Event handlers: `handle*` (e.g., `handleStateChange`, `handleSelectScenario`, `handleCreateScenario`)
- Component names: PascalCase (e.g., `ComparisonView`, `Calculator`, `ErrorBoundary`)

**Variables:**

- camelCase for all variables and constants
- UPPERCASE for static constants (e.g., `STORAGE_KEY`, `MAX_SCENARIOS`, `LEGACY_STORAGE_KEY_LEFT`)
- Prefixes for intent:
  - `is*` for booleans (e.g., `isCompareMode`, `isIncorporated`, `isSelfEmployed`)
  - `has*` for existence checks (e.g., `hasLabel`, `hasError`)
  - `show*` for visibility flags (e.g., `showTaxEstimate`, `showSaved`)
  - `use*` for hook results (e.g., `useCalculation`)

**Types:**

- PascalCase for interface and type names (e.g., `CalculatorState`, `SavedScenario`, `TaxBracket`)
- Suffix `Props` for component prop interfaces (e.g., `ComparisonViewProps`, `ComparisonRowProps`)
- Suffix `Result` or `Breakdown` for computed results (e.g., `CalculationResult`, `CorpBreakdown`, `TaxBreakdown`)
- Suffix `Config` for configuration objects (e.g., `TaxConfig`)
- Use union types over enums (e.g., `type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'MXN'`)

**Import Aliases:**

- `@/*` maps to `./src/*` - used throughout for absolute imports
- Example: `import type { CalculatorState } from '@/types'` instead of relative paths

## Code Style

**Formatting:**

- ESLint with TypeScript support (`typescript-eslint`)
- No Prettier config present - ESLint rules enforce style
- 2-space indentation (inferred from project structure)
- Semicolons required
- Single quotes preferred for strings (enforced by ESLint)

**Linting:**

- Tool: ESLint 9.39.1 with TypeScript ESLint 8.46.4
- Config: `eslint.config.js` (flat config format)
- Plugins:
  - `eslint-plugin-react-hooks` - enforces hooks rules
  - `eslint-plugin-react-refresh` - Vite react-refresh compatibility
- Rules:
  - Extends `js.configs.recommended` and `tseslint.configs.recommended`
  - React hooks rules enforced (dependencies, exhaustive-deps)
  - ES2020+ syntax target

**TypeScript Settings (strict mode):**

- `strict: true` - enables all strict type checking options
- `noUnusedLocals: true` - error on unused variables
- `noUnusedParameters: true` - error on unused function parameters
- `noFallthroughCasesInSwitch: true` - error on missing case breaks
- `noUncheckedSideEffectImports: true` - warn on unsafe side-effect imports
- Target: ES2022
- Module: ESNext with bundler resolution

## Import Organization

**Order:**

1. React and external libraries (React, hooks, third-party UI/animation)
2. Internal components (`@/components/*`)
3. Internal hooks (`@/hooks/*`)
4. Internal utilities and types (`@/lib/*`, `@/types`, `@/data/*`)
5. Styles (if using separate CSS imports)

**Examples from codebase:**

```typescript
// App.tsx order
import { useState, useEffect, useCallback, useRef } from "react";
import { ComparisonView } from "@/components/ComparisonView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OnboardingTour } from "@/components/OnboardingTour";
import { ScenarioSwitcher } from "@/components/ScenarioSwitcher";
import { FooterContent } from "@/components/FooterContent";
import { useScenarios } from "@/hooks/useScenarios";
import { DEFAULT_STATE, type CalculatorState } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
```

**Import style:**

- Always use `import type` for type-only imports to avoid runtime bloat
- Example: `import type { CalculatorState, SavedScenario, Currency } from '@/types'`
- Separate type imports from value imports when both are needed:
  ```typescript
  import { isContractorType } from "@/types";
  import type { CalculatorState } from "@/types";
  ```

**Path aliases:**

- Never use relative imports (e.g., `../../` or `./`)
- Always use `@/` alias even within same directory level
- Config in `tsconfig.app.json`: `"@/*": ["./src/*"]`

## Error Handling

**Patterns:**

- Use try-catch for localStorage operations (JSON.parse can fail)
- Catch blocks should log errors with context using `console.warn` or `console.error`
- Example from `useLocalStorage.ts`:

  ```typescript
  try {
    const item = window.localStorage.getItem(key);
    // ... parse and return
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
  ```

- Error boundaries: Use class component `ErrorBoundary` to wrap app
  - `getDerivedStateFromError()` captures error state
  - `componentDidCatch()` logs errors and errorInfo
  - Display fallback UI with refresh button in production
  - Show error details in dev mode only (check `import.meta.env.DEV`)

- Optional chaining and nullish coalescing for defensive programming:
  - `activeScenario?.state ?? DEFAULT_STATE`
  - `scenario?.name ?? fallback`

- Fallback patterns:
  - Parse failures default to initial value
  - Missing scenarios fallback to props or DEFAULT_STATE
  - Enum/region lookups default to passed value if not found

## Logging

**Framework:** Built-in `console` object

**Patterns:**

- `console.warn()` - for recoverable errors (localStorage, parsing failures)
- `console.error()` - for critical errors in error boundaries
- No structured logging library used
- Error logging includes context: `console.warn('Error reading key:', error)`
- Dev-only logging: wrap with `import.meta.env.DEV` check:
  ```typescript
  {import.meta.env.DEV && this.state.error && (
    <pre>{this.state.error.message}</pre>
  )}
  ```

## Comments

**When to Comment:**

- Explain WHY, not WHAT - code should be self-documenting
- Comments above functions explain purpose and special cases
- Inline comments for business logic or tax calculations (domain-specific)
- Examples from codebase:

  ```typescript
  // Legacy storage keys for migration
  const LEGACY_STORAGE_KEY_LEFT = 'celery-calculator-left'

  // Calculate billable hours after subtracting time off
  export function calcBillableHours(...)

  // Handle different employment types
  if (state.employmentType === 'contractor-retainer') { ... }
  ```

**JSDoc/TSDoc:**

- Used for exported functions, especially in libraries
- Format: block comment with `/**` prefix
- Include description, @param, @returns for public APIs
- Example from `calculate.ts`:

  ```typescript
  /**
   * Calculate billable hours after subtracting time off
   */
  export function calcBillableHours(
    weeksPerYear: number,
    daysPerWeek: number,
    hoursPerDay: number,
    holidays: number,
    ptoDays: number,
    sickDays: number,
  ): number;
  ```

- Not used for simple components or obvious functions
- TypeScript types replace JSDoc @param/return in most cases

## Function Design

**Size:**

- Keep functions under 50 lines where possible
- Complex calculations (tax, corp breakdown) can exceed this for clarity
- Break into helper functions for reusability

**Parameters:**

- Maximum 5-6 parameters; use objects for more
- Example good: `formatCurrency(amount, currency, options?: { compact?: boolean; showCode?: boolean })`
- Example: Component prop interfaces for complex structures

**Return Values:**

- Always explicit return types in TypeScript
- Return early to reduce nesting
- Example from `useLocalStorage`:

  ```typescript
  if (typeof window === 'undefined') {
    return initialValue
  }
  try {
    // ...
  } catch (error) {
    console.warn(...)
    return initialValue
  }
  return parsed
  ```

- Tuple return for dual values: `[value, setter]` (React pattern)

## Module Design

**Exports:**

- Named exports for utilities: `export function calcBaseHours(...)`
- Named exports for types: `export interface CalculatorState`
- Default exports only for React components
- Example from `calculate.ts`: All functions are named exports
- Example from `App.tsx`: `export default App`

**Barrel Files:**

- Used selectively for type collections (e.g., `types.ts` exports all types)
- Not used for component collections (import directly from component)
- Pattern: `export type { TypeA, TypeB } from './subtypes'`

**File Responsibilities:**

- Separate concerns: business logic in `lib/`, UI in `components/`, state in `hooks/`
- `lib/calculate.ts` - pure calculation functions
- `lib/tax.ts` - tax bracket logic
- `hooks/useCalculation.ts` - memoized calculation result
- `hooks/useScenarios.ts` - scenario state management
- `data/tax-brackets-2026.ts` - tax configuration (not logic)

## React Patterns

**Functional Components Only:**

- All components are functional (no class components)
- Exception: `ErrorBoundary` uses class component (required for error boundaries)

**Hooks Usage:**

- `useState()` for local UI state
- `useCallback()` for memoized event handlers to prevent re-renders
- `useMemo()` for expensive calculations (tax calculations, comparisons)
- `useEffect()` for side effects (localStorage persistence, migrations)
- Custom hooks for reusable logic (`useScenarios`, `useCalculation`, `useLocalStorage`)

**Props:**

- Define prop interfaces with `Props` suffix
- Use destructuring in function parameters
- Provide default values: `scenarios = []`
- Example from `ComparisonView`:

  ```typescript
  interface ComparisonViewProps {
    leftState: CalculatorState
    rightState: CalculatorState | null
    onLeftChange: (state: CalculatorState) => void
    scenarios?: SavedScenario[]
  }

  export function ComparisonView({
    scenarios = [],
    ...
  }: ComparisonViewProps)
  ```

## Styling

**Framework:** Tailwind CSS 4 with `@tailwindcss/vite`

**Patterns:**

- Utility-first approach - compose styles with class names
- CSS-in-JS for dynamic styles using template literals
- Example: `className={winner === 'left' ? 'bg-emerald-500/10' : ''}`
- Theme support: dark mode via class selector (no context needed)
- Component library: shadcn/ui (Radix primitives) - pre-styled with Tailwind

**Class naming:**

- Tailwind utilities only, no custom BEM naming
- Responsive prefixes: `sm:`, `md:`, `lg:`
- State variants: `hover:`, `active:`, `focus:`
- Dark mode: `dark:` prefix

---

_Convention analysis: 2026-02-01_
