# Codebase Structure

**Analysis Date:** 2026-02-01

## Directory Layout

```
celery/
├── src/
│   ├── components/           # React UI components
│   │   ├── ui/              # shadcn/ui primitives (Card, Button, Input, etc.)
│   │   ├── Calculator.tsx    # Main input form component (~800 lines)
│   │   ├── ComparisonView.tsx # Scenario comparison and two-column layout
│   │   ├── AnimatedNumber.tsx # Animated number display utility
│   │   ├── ExchangeRateDisplay.tsx # Currency conversion display
│   │   ├── FooterContent.tsx # SEO content section
│   │   ├── ScenarioSwitcher.tsx # Scenario selector/creator
│   │   ├── ThemeToggle.tsx   # Light/dark mode toggle
│   │   ├── OnboardingTour.tsx # Tutorial overlay
│   │   └── ErrorBoundary.tsx # Error fallback component
│   ├── hooks/               # Custom React hooks
│   │   ├── useCalculation.ts # Core calculation logic (memoized)
│   │   ├── useScenarios.ts  # Scenario CRUD operations
│   │   ├── useExchangeRate.ts # Exchange rate API handling
│   │   ├── useLocalStorage.ts # localStorage persistence
│   │   ├── useUrlState.ts   # URL parameter serialization
│   │   └── useTheme.ts      # Dark mode state management
│   ├── lib/                 # Utility functions (no React)
│   │   ├── calculate.ts     # Financial calculations (gross, net, formatting)
│   │   ├── tax.ts           # Tax bracket calculations
│   │   ├── utils.ts         # Generic utilities
│   │   └── analytics.ts     # Analytics initialization (PostHog)
│   ├── data/                # Static data sources
│   │   ├── tax-brackets-2026.ts # Tax rates for CA/US by region, corp tax rates
│   │   └── holidays-2026.ts # Holiday counts by country/province
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Root component (scenarios orchestration)
│   ├── main.tsx             # Entry point (React.createRoot)
│   ├── index.css            # Global Tailwind styles
│   ├── assets/              # Images, icons
│   └── test/                # Test utilities
│       └── setup.ts         # Vitest configuration
├── e2e/                     # Playwright E2E tests
│   └── *.spec.ts
├── public/                  # Static assets (favicon, PWA icons)
├── docs/                    # Documentation
├── vite.config.ts           # Vite build configuration with PWA plugin
├── tsconfig.app.json        # TypeScript strict mode config
├── package.json             # Dependencies and scripts
├── index.html               # HTML entry point with meta tags
├── playwright.config.ts     # Playwright test configuration
└── vitest.config.ts         # Vitest unit test configuration
```

## Directory Purposes

**src/components/:**

- Purpose: All React UI components using shadcn/ui and Radix primitives
- Contains: Presentation layer only (no business logic)
- Key files: Calculator.tsx is largest (~800 lines), renders all input forms and uses hooks
- ui/ subdirectory contains shadcn component library (auto-generated, do not edit except types)

**src/hooks/:**

- Purpose: Custom React hooks for state management and business logic integration
- Contains: `useCalculation` (core memoized calculations), `useScenarios` (CRUD), API hooks, localStorage binding
- Pattern: Each hook is self-contained, reusable, decoupled from component tree

**src/lib/:**

- Purpose: Pure utility functions without React dependency
- Contains: Financial calculations, tax bracket logic, formatting utilities, analytics init
- Key files: `calculate.ts` (hours/salary math), `tax.ts` (progressive bracket calculations)
- Pattern: Functional, deterministic, heavily unit-tested

**src/data/:**

- Purpose: Static lookup data and constants
- Contains: Tax brackets for 2026 (CA/US), holiday counts, employment type definitions
- Key files: `tax-brackets-2026.ts` is updated annually before Jan 1
- Pattern: Data-driven, separated from logic for easy updates

**e2e/:**

- Purpose: Playwright E2E tests covering full user workflows
- Pattern: Test selectors use `data-testid` attributes on critical UI elements
- Run: `bun run test:e2e`

**public/:**

- Purpose: Static assets served at root URL
- Contains: favicon.svg, apple-touch-icon.png, PWA icons (192x192, 512x512), mask-icon.svg

## Key File Locations

**Entry Points:**

- `index.html`: HTML entry, loads `src/main.tsx`, contains SEO meta tags and JSON-LD schema
- `src/main.tsx`: React.createRoot, ErrorBoundary wrapper, analytics init
- `src/App.tsx`: Root component, scenarios management, layout orchestration

**Configuration:**

- `vite.config.ts`: Build config, PWA plugin, path alias (@/ → src/)
- `tsconfig.app.json`: Strict mode, path aliases, React JSX
- `playwright.config.ts`: E2E test config, browser targets
- `vitest.config.ts`: Unit test runner config

**Core Logic:**

- `src/lib/calculate.ts`: Billable hours, gross/net salary calculations
- `src/lib/tax.ts`: Progressive tax bracket calculations, SE tax for US, CPP for CA
- `src/hooks/useCalculation.ts`: Orchestrates calculations, handles all employment types and corp structures
- `src/data/tax-brackets-2026.ts`: Tax rates source of truth (federal, provincial/state)

**Testing:**

- `e2e/*.spec.ts`: Playwright tests for key workflows
- `src/**/*.test.ts`: Vitest unit tests (co-located with source)

**Components:**

- `src/components/Calculator.tsx`: Input form for all calculator parameters
- `src/components/ComparisonView.tsx`: Two-column comparison, scenario selector
- `src/components/FooterContent.tsx`: SEO content, below fold

## Naming Conventions

**Files:**

- Components: PascalCase (Calculator.tsx, ComparisonView.tsx)
- Hooks: camelCase with `use` prefix (useCalculation.ts, useScenarios.ts)
- Utilities: camelCase (calculate.ts, tax.ts, analytics.ts)
- Types: Uppercase or PascalCase (types.ts defines CalculatorState, SavedScenario)
- Tests: Match source filename + .test.ts (calculate.test.ts pairs with calculate.ts)

**Functions:**

- Calculation functions: camelCase (calcGrossAnnual, calcBillableHours)
- Formatting functions: formatX pattern (formatCurrency, formatPercent)
- Helpers starting with get: camelCase (getCorpTaxRate, getCountry)

**Variables/Constants:**

- React state: camelCase (activeScenarioId, isCompareMode)
- localStorage keys: lowercase with hyphens (celery-scenarios, celery-exchange-rates)
- Type/Interface names: PascalCase (CalculatorState, SavedScenario, CorpBreakdown)
- Enum-like constants: SCREAMING_SNAKE_CASE (STORAGE_KEY, MAX_SCENARIOS, LEGACY_STORAGE_KEY_LEFT)

## Where to Add New Code

**New Feature - Tax Calculation:**

- Calculation logic: `src/lib/tax.ts` (pure functions)
- Hook integration: `src/hooks/useCalculation.ts` (call lib function, memoize result)
- UI: `src/components/Calculator.tsx` (add form field) or `src/components/ComparisonView.tsx` (add row)
- Data: `src/data/tax-brackets-2026.ts` (update brackets if needed)
- Tests: `src/lib/tax.test.ts` (test calculation), `e2e/*.spec.ts` (test UI)

**New Component:**

- Implementation: `src/components/NewComponent.tsx`
- Import in parent: `src/App.tsx` or `src/components/Calculator.tsx`
- Styling: Use Tailwind utility classes + shadcn/ui components
- Local state: React hooks (useState, useCallback)
- Shared state: Access via props from parent or useX hook

**New Hook:**

- Implementation: `src/hooks/useNewFeature.ts`
- Return: Object with state + setters or calculated values
- Used by: Components import and call hook
- Caching: Use `useMemo` for expensive calculations, `useCallback` for event handlers

**Utilities:**

- Shared helpers: `src/lib/utils.ts`
- Purpose-specific: `src/lib/yourFeature.ts` (e.g., calculate.ts, tax.ts)
- No React imports: Keep functions pure and testable

**Data/Constants:**

- Static lookup: `src/data/yourData.ts` (e.g., tax-brackets-2026.ts)
- Type definitions: `src/types.ts` (add interfaces, types)

**Tests:**

- Unit tests: Co-located with source (calculate.test.ts next to calculate.ts)
- E2E tests: `e2e/yourFeature.spec.ts`
- Pattern: Happy path + edge cases, use data-testid for selectors

## Special Directories

**src/components/ui/:**

- Purpose: shadcn/ui component library
- Generated: Yes (via shadcn CLI, do not hand-edit)
- Committed: Yes (checked into git)
- Pattern: Barrel exports, Radix primitives underneath
- When adding new component: Run `bunx shadcn-ui@latest add <component-name>`

**dist/:**

- Purpose: Production build output
- Generated: Yes (by `bun run build`)
- Committed: No (.gitignore)
- Contents: Optimized JS/CSS bundles, PWA manifest, source maps

**node_modules/:**

- Purpose: Dependency installation
- Generated: Yes (from bun.lock)
- Committed: No
- Lock file: bun.lock tracks exact versions

**/public/:**

- Purpose: Static files served at root (celery.info/favicon.svg)
- Committed: Yes
- Files: Favicon, PWA icons, robots.txt (if needed)
- Build: Files copied to dist root during build

---

_Structure analysis: 2026-02-01_
