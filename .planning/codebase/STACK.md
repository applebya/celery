# Technology Stack

**Analysis Date:** 2026-02-01

## Languages

**Primary:**

- TypeScript 5.9.3 - Full application codebase with strict mode enabled

**Secondary:**

- JavaScript (via React/Vite tooling)
- HTML/CSS (Tailwind CSS framework)

## Runtime

**Environment:**

- Node.js (via Bun package manager)
- Browser: ES2022 target, DOM APIs

**Package Manager:**

- Bun (latest, configured in `.github/workflows/`)
- Lockfile: `bun.lock` (frozen lockfile required in CI)

## Frameworks

**Core:**

- React 19.2.0 - UI framework
- React DOM 19.2.0 - Rendering layer

**Build/Dev:**

- Vite 7.2.4 - Build tool with dev server on localhost:5173
- @vitejs/plugin-react 5.1.1 - React support in Vite
- @tailwindcss/vite 4.1.18 - Tailwind CSS integration

**Styling:**

- Tailwind CSS 4.1.18 - Utility-first CSS framework
- tailwind-merge 3.4.0 - Merge Tailwind class conflicts
- clsx 2.1.1 - Dynamic classname composition

**Components:**

- shadcn/ui (Radix UI primitives)
  - @radix-ui/react-collapsible 1.1.12
  - @radix-ui/react-label 2.1.8
  - @radix-ui/react-select 2.2.6
  - @radix-ui/react-slider 1.3.6
  - @radix-ui/react-slot 1.2.4
  - @radix-ui/react-switch 1.2.6
  - @radix-ui/react-tabs 1.1.13
  - @radix-ui/react-tooltip 1.2.8

**Animation:**

- framer-motion 12.26.2 - Animation library for React
- lucide-react 0.562.0 - Icon library

**Utilities:**

- class-variance-authority 0.7.1 - Component variant management

## Key Dependencies

**Critical:**

- posthog-js 1.244.0 - Analytics/event tracking (configured via environment variables)
- vite-plugin-pwa 1.2.0 - Progressive Web App support with Workbox service worker
- rollup-plugin-visualizer 6.0.5 - Bundle analysis

**Infrastructure:**

- jsdom 27.4.0 - DOM implementation for testing
- @testing-library/react 16.3.1 - React component testing utilities
- @testing-library/user-event 14.6.1 - User interaction simulation
- @testing-library/jest-dom 6.9.1 - DOM matchers

## Testing

**Testing Frameworks:**

- Vitest 4.0.16 - Unit test runner
- @vitest/coverage-v8 4.0.16 - Code coverage
- Playwright 1.52.0 - E2E browser testing
- @playwright/test 1.52.0 - Playwright test framework
- @axe-core/react 4.11.0 - Accessibility testing
- @axe-core/playwright 4.11.0 - A11y testing in Playwright
- jest-axe 10.0.0 - Accessibility assertions

## Code Quality

**Linting:**

- ESLint 9.39.1 - JavaScript/TypeScript linting
- @eslint/js 9.39.1 - ESLint core rules
- typescript-eslint 8.46.4 - TypeScript linting rules
- eslint-plugin-react-hooks 7.0.1 - React Hooks rules
- eslint-plugin-react-refresh 0.4.24 - React Fast Refresh rules
- globals 16.5.0 - Global variable definitions

**Type Checking:**

- TypeScript strict mode (all compiler flags enabled)
  - `strict: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noFallthroughCasesInSwitch: true`
  - `noUncheckedSideEffectImports: true`

## Configuration

**Environment:**

- VITE_PUBLIC_POSTHOG_KEY - PostHog project token (injected at build time in CI)
- VITE_PUBLIC_POSTHOG_HOST - PostHog API host (defaults to https://us.i.posthog.com)
- DEV environment detection (via import.meta.env.DEV)

**Build:**

- `vite.config.ts` - Main build configuration with PWA manifest, Workbox caching, path aliases
- `tsconfig.json` - TypeScript root configuration with path aliases
- `tsconfig.app.json` - App-specific TypeScript settings (ES2022 target, bundler resolution)
- `tsconfig.node.json` - Node/build tool configuration
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `components.json` - shadcn/ui component generation config

**Path Aliases:**

- `@/*` → `./src/*`

## Platform Requirements

**Development:**

- Bun runtime (preferred) or Node.js compatible
- Modern browser with ES2022 support

**Production:**

- GitHub Pages (static hosting)
- Cloudflare or similar CDN for domain management
- All assets served over HTTPS

---

_Stack analysis: 2026-02-01_
