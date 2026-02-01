# Testing Patterns

**Analysis Date:** 2026-02-01

## Test Framework

**Runner:**

- Vitest 4.0.16 (unit tests)
- Config: `vitest.config.ts`

**E2E Framework:**

- Playwright 1.52.0 (integration and end-to-end tests)
- Config: `playwright.config.ts`

**Assertion Library:**

- Vitest built-in expect API
- Testing Library for React component testing
- Playwright assertions (`expect(page).toHaveTitle()`, etc.)

**Run Commands:**

```bash
bun run test          # Unit tests (watch mode)
bun run test:run      # Unit tests (single run)
bun run test:e2e      # Playwright E2E tests
bun run test:e2e:ui   # Playwright UI mode (interactive)
```

## Test File Organization

**Location:**

- Unit tests: co-located with source files (same directory)
- E2E tests: separate `e2e/` directory at project root
- Setup files: `src/test/setup.ts` for vitest configuration

**Naming:**

- Unit test suffix: `.test.ts` for pure functions, `.test.tsx` for React components
- E2E test suffix: `.spec.ts` (Playwright convention)
- Examples:
  - `src/lib/calculate.test.ts` - utility tests
  - `src/components/AnimatedNumber.test.tsx` - component tests
  - `e2e/app.spec.ts` - main app flow tests
  - `e2e/accessibility.spec.ts` - a11y tests

**Structure:**

```
src/
├── lib/
│   ├── calculate.ts
│   ├── calculate.test.ts
│   ├── tax.ts
│   └── tax.test.ts
├── components/
│   ├── AnimatedNumber.tsx
│   ├── AnimatedNumber.test.tsx
│   └── ErrorBoundary.tsx
├── hooks/
│   ├── useScenarios.ts
│   ├── useUrlState.ts
│   └── useUrlState.test.ts
└── test/
    └── setup.ts
e2e/
├── app.spec.ts
└── accessibility.spec.ts
```

## Vitest Configuration

**Location:** `/Users/applebya/dev/celery/vitest.config.ts`

**Settings:**

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Use global describe/it/expect
    environment: "jsdom", // DOM environment for React tests
    setupFiles: "./src/test/setup.ts", // Global setup
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Test Setup File:** `src/test/setup.ts`

Mocks window APIs:

```typescript
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock matchMedia for theme detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## Test Structure

**Vitest Unit Test Pattern:**

```typescript
import { describe, it, expect } from "vitest";
import { calcBillableHours } from "./calculate";

describe("calcBillableHours", () => {
  it("subtracts holidays from base hours", () => {
    // 2080 - (9 holidays * 8 hours) = 2008
    expect(calcBillableHours(52, 5, 8, 9, 0, 0)).toBe(2008);
  });

  it("subtracts PTO days", () => {
    expect(calcBillableHours(52, 5, 8, 0, 7, 0)).toBe(2024);
  });

  it("handles edge cases", () => {
    expect(calcBillableHours(52, 5, 8, 0, 0, 5)).toBe(2040);
  });
});
```

**Patterns:**

- Group tests by function name using `describe()`
- Use descriptive test names starting with "should" or action verb
- Comments explain calculation logic, especially for business domain (taxes)
- Test both happy path and edge cases
- Use `toBeCloseTo()` for floating-point comparisons
- Example from `tax.test.ts`:
  ```typescript
  it("calculates tax spanning multiple brackets", () => {
    const brackets = [
      { min: 0, max: 55867, rate: 0.15 },
      { min: 55867, max: 111733, rate: 0.205 },
    ];
    expect(calcBracketTax(100000, brackets)).toBeCloseTo(17427, 0);
  });
  ```

**React Component Test Pattern:**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimatedNumber } from './AnimatedNumber'

describe('AnimatedNumber', () => {
  it('displays formatted initial value', () => {
    render(
      <AnimatedNumber
        value={1000}
        formatter={(n) => `$${n.toFixed(0)}`}
      />
    )
    expect(screen.getByText('$1000')).toBeInTheDocument()
  })
})
```

- Import from `@testing-library/react`
- Use `render()` to mount component
- Use `screen` queries to find elements
- Assert using Testing Library matchers and `@testing-library/jest-dom` matchers

## Playwright E2E Configuration

**Location:** `/Users/applebya/dev/celery/playwright.config.ts`

**Key Settings:**

```typescript
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fail if .only() left in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173/",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Firefox and Safari commented out but available
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:5173/",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

## E2E Test Structure

**File:** `e2e/app.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Celery Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads the calculator", async ({ page }) => {
    await expect(page).toHaveTitle(/Celery/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("calculates salary from hourly rate", async ({ page }) => {
    const hourlyInput = page.getByLabel(/hourly/i);
    await hourlyInput.fill("50");
    await expect(page.getByText(/\$[\d,]+/).first()).toBeVisible();
  });

  test("persists values on reload", async ({ page }) => {
    const hourlyInput = page.getByLabel(/hourly/i);
    await hourlyInput.fill("75");
    await page.reload();
    await expect(hourlyInput).toHaveValue("75");
  });
});
```

**Patterns:**

- Group tests by feature/component using `test.describe()`
- Use `test.beforeEach()` for setup (navigate to page, login, etc.)
- Use semantic selectors: `getByRole()`, `getByLabel()`, `getByText()` prefer over CSS selectors
- Use regex patterns for flexible matching: `/hourly/i` for case-insensitive
- Wait for elements implicitly - most Playwright methods auto-wait
- Use `expect().toPass()` for retry logic on flaky assertions

**Selector Strategy:**

- Prefer `getByRole()` - most accessible and maintainable
- Use `getByLabel()` for form inputs
- Use `getByText()` for text content with regex
- Avoid CSS selectors (`.calculated-value`) - fragile to refactoring
- No `data-testid` attributes added for E2E (they're for unit/integration tests)

## Accessibility Testing

**File:** `e2e/accessibility.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("calculator inputs have proper labels", async ({ page }) => {
    await page.goto("/");
    const inputs = page.locator("input");
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      const hasLabel = id
        ? (await page.locator(`label[for="${id}"]`).count()) > 0
        : false;
      const hasAriaLabel = !!ariaLabel;
      const hasAriaLabelledBy = !!ariaLabelledBy;

      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true);
    }
  });

  test("focus is visible on interactive elements", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});
```

**Tools:**

- `@axe-core/playwright` for automated accessibility scanning
- Manual tests for keyboard navigation (Tab, Enter, etc.)
- Tests verify all inputs have labels (via `for`, `aria-label`, or `aria-labelledby`)

## Mocking Patterns

**Framework:** Vitest's `vi` object

**localStorage Mocking:**

- Mocked globally in `src/test/setup.ts` using `vi.fn()`
- No interaction with real localStorage during tests
- Tests can verify localStorage operations were called:
  ```typescript
  expect(window.localStorage.setItem).toHaveBeenCalledWith(key, data);
  ```

**What to Mock:**

- Browser APIs: `localStorage`, `matchMedia`, `window.location`
- External services: API calls, analytics (setup once globally)
- Heavy computations: expensive calculations if testing dependent code

**What NOT to Mock:**

- Internal functions - import and test them directly
- React hooks - test components that use them
- CSS-in-JS or styling - test visual output, not internals
- Data transformations - test the actual functions

## Fixtures and Factories

**Test Data:**

- Inline constants for simple data
- Example from `calculate.test.ts`:
  ```typescript
  const brackets = [
    { min: 0, max: 55867, rate: 0.15 },
    { min: 55867, max: 111733, rate: 0.205 },
  ];
  expect(calcBracketTax(100000, brackets)).toBeCloseTo(17427, 0);
  ```

**Location:**

- No separate fixture files currently used
- Test data lives inline within test files
- Could extract to `src/test/fixtures/` if patterns repeat

**Factories:**

- Not used explicitly
- Component props tests use direct object literals
- Could add helpers like `createCalculatorState()` if needed

## Coverage

**Requirements:** Not enforced (no coverage threshold configured)

**View Coverage:**

```bash
# Not currently configured
# Would use: vitest --coverage
```

**Current Coverage State:**

- Unit tests exist for critical calculation logic (`calculate.ts`, `tax.ts`)
- E2E tests cover happy paths and persistence
- Component tests minimal (AnimatedNumber only)
- Gaps: Most components untested (reliant on E2E)

**Strategy:**

- Focus on unit tests for pure functions (calculations, formatting)
- E2E tests for user workflows (core calculator flow, persistence, persistence)
- Component tests only for isolated, reusable components

## Test Types

**Unit Tests:**

- Scope: Pure functions in `lib/`, `data/`, and `types/`
- Examples: `calculate.test.ts` (tax calculations), `tax.test.ts` (bracket logic)
- Approach: Test with multiple inputs, edge cases, boundary conditions
- Files tested:
  - `src/lib/calculate.ts` - calcBaseHours, calcBillableHours, formatCurrency, formatPercent
  - `src/lib/tax.ts` - calcBracketTax, calcFederalTax, calcProvincialStateTax, calcTotalTax
  - `src/data/holidays-2026.test.ts` - holiday data validation
  - `src/hooks/useUrlState.test.ts` - URL state serialization

**Integration Tests:**

- Scope: Hooks and their integration with state
- Examples: `useScenarios` managing scenario CRUD with localStorage
- Not separately named but could be isolated with `@vitest/ui`

**E2E Tests:**

- Scope: Full user workflows from browser
- Examples: Loading calculator, entering values, verifying calculations display, persisting on reload
- Framework: Playwright
- Browsers: Chromium (Firefox/Safari available but commented out)
- Files:
  - `e2e/app.spec.ts` - core calculator functionality
  - `e2e/accessibility.spec.ts` - a11y compliance

## Common Patterns

**Async Testing (E2E):**

```typescript
test("persists values on reload", async ({ page }) => {
  const hourlyInput = page.getByLabel(/hourly/i);
  await hourlyInput.fill("75"); // Auto-waits for input to be ready
  await page.reload(); // Wait for navigation complete
  await expect(hourlyInput).toHaveValue("75"); // Auto-waits for value
});
```

- Playwright auto-waits for elements and navigation
- Use `async/await` for sequential operations
- E2E tests are inherently async due to page interactions

**Error Testing:**

- Negative test cases for tax calculations:

  ```typescript
  it("returns 0 for Texas (no state income tax)", () => {
    const tax = calcProvincialStateTax("US", "TX", 100000);
    expect(tax).toBe(0);
  });
  ```

- Error conditions in hooks:
  ```typescript
  it("handles invalid localStorage data gracefully", () => {
    // Setup mocks to return invalid JSON
    // Verify function falls back to initialValue
  });
  ```

**Boundary Testing:**

- Test at tax bracket boundaries:
  ```typescript
  it("calculates tax spanning multiple brackets", () => {
    // $100,000 crosses bracket boundary at $55,867
    expect(calcBracketTax(100000, brackets)).toBeCloseTo(17427, 0);
  });
  ```

**Range Testing (for rates and percentages):**

- Use range assertions when exact values vary by environment:
  ```typescript
  it("calculates Canada federal tax for $100k income", () => {
    const tax = calcFederalTax("CA", 100000);
    expect(tax).toBeGreaterThan(17000);
    expect(tax).toBeLessThan(18000);
  });
  ```

## Running Tests Locally

**Watch Mode (development):**

```bash
bun run test
# Runs all unit tests in watch mode
# Re-runs on file changes
```

**Single Run (CI/verification):**

```bash
bun run test:run
# Runs all unit tests once
# Exits with success/failure
```

**E2E Tests:**

```bash
# Must run dev server first in another terminal
bun run dev

# Then in another terminal
bun run test:e2e
# Runs Playwright tests in headless mode
# Generates HTML report in playwright-report/
```

**Interactive E2E (debugging):**

```bash
bun run test:e2e:ui
# Opens Playwright Inspector UI
# Allows step-through, element inspection, visual feedback
```

---

_Testing analysis: 2026-02-01_
