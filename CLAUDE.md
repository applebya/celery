# Celery - Salary Calculator

## Overview
A privacy-focused salary calculator that converts hourly rates to annual compensation with tax estimates for USA and Canada. Works offline as a PWA.

**Live**: https://celery.info
**Repo**: https://github.com/applebya/celery

## Tech Stack
- React 19 + TypeScript (strict mode)
- Vite 7 with @tailwindcss/vite
- shadcn/ui components (Radix primitives)
- Vitest for unit tests
- Playwright for E2E tests

## Key Commands
```bash
bun install          # Install dependencies
bun run dev          # Dev server at localhost:5173
bun run build        # Type-check + production build
bun run test         # Unit tests (watch mode)
bun run test:run     # Unit tests (single run)
bun run test:e2e     # Playwright E2E tests
bun run lint         # ESLint
```

## Architecture

### State Management
- URL parameters for shareable state (future)
- localStorage for persistence (useLocalStorage hook)
- React state for UI interactions

### Key Files
- `src/components/Calculator.tsx` - Main calculator UI (~28KB, largest component)
- `src/lib/calculate.ts` - Core calculation logic
- `src/lib/tax.ts` - Tax bracket calculations
- `src/data/tax-brackets-2026.ts` - Current tax data
- `src/hooks/` - Custom React hooks

### Data Flow
1. User inputs hourly rate, hours/week, weeks/year
2. `useCalculation` hook computes gross annual
3. Tax estimates calculated based on selected jurisdiction
4. Results displayed with currency conversion (optional)

## Testing Patterns
- Unit tests: `*.test.ts` files alongside source
- E2E tests: `e2e/` folder with Playwright
- Use `data-testid` attributes for reliable E2E selectors

## Conventions
- Functional components with hooks
- TypeScript strict mode (no `any`)
- Tailwind for styling, shadcn/ui for components
- Conventional commits preferred

## Tax Data
Tax brackets are for **2026** estimates. Sources:
- USA: IRS projected brackets
- Canada: CRA projected brackets

**Disclaimer**: This is for estimation only, not tax advice.

## PWA Features
- Offline-capable via Workbox service worker
- Exchange rate caching (24hr)
- Installable on mobile/desktop
