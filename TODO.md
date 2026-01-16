# Celery Visual Polish & Scenarios - Implementation Plan

> **To continue:** Open a new Claude session and say "Continue implementing the TODO.md plan"

## Overview

Transform Celery into a visually striking, modern calculator with saved scenarios and upgraded comparison - while keeping the UI clean and focused.

**Design doc:** `docs/plans/2026-01-15-visual-polish-design.md`

**Style direction:** Bold & modern (Vercel/Stripe aesthetic) - strong typography, gradient accents, confident color use

---

## Phase 1: Visual Polish

### Task 1.1: Result Card Typography Upgrade
**Files:** `src/components/Calculator.tsx`
**Changes:**
- Main number: `text-3xl` → `text-5xl font-bold tracking-tight`
- Add `tabular-nums` to all currency values
- Labels: `text-xs uppercase tracking-wide text-muted-foreground`
- Increase hierarchy contrast between primary and secondary numbers

### Task 1.2: Result Card Gradient Accent
**Files:** `src/components/Calculator.tsx`
**Changes:**
- Add 4px gradient top border to result Card: `from-emerald-500 to-teal-500`
- Upgrade shadow: `shadow-xl shadow-black/5`
- Add hover state: `hover:shadow-2xl transition-shadow`

### Task 1.3: Settings Panel Polish
**Files:** `src/components/Calculator.tsx`
**Changes:**
- Add `backdrop-blur-sm bg-card/50` to settings container
- Remove visible borders between collapsed sections
- Add subtle left border accent to open section
- Smooth transitions on expand/collapse

### Task 1.4: Input Styling Upgrade
**Files:** `src/components/Calculator.tsx`, `src/components/ui/input.tsx`
**Changes:**
- Main input: `text-xl` → `text-2xl`, consider underline style instead of box
- Currency selector: more prominent flag, pill-style
- Add subtle hover states to all interactive elements

### Task 1.5: Add Micro-interactions
**Files:** `package.json`, `src/components/Calculator.tsx`
**Changes:**
- Install framer-motion: `bun add framer-motion`
- Button/chip hover: `scale-[1.02]` with 150ms ease-out
- Collapsible: spring animation for open/close
- Ensure AnimatedNumber has smooth spring physics

---

## Phase 2: Saved Scenarios

### Task 2.1: Scenario Data Layer
**Files:** `src/types.ts`, `src/hooks/useScenarios.ts` (new)
**Changes:**
- Add `SavedScenario` interface to types.ts
- Create `useScenarios` hook with:
  - `scenarios: SavedScenario[]`
  - `activeScenarioId: string | null`
  - `saveScenario(state): void`
  - `loadScenario(id): CalculatorState`
  - `deleteScenario(id): void`
  - `renameScenario(id, name): void`
- localStorage key: `celery-scenarios`
- Max 10 scenarios, auto-delete oldest
- Auto-generate names: `$${rate}/hr · ${region}` or `$${salary/1000}k · ${region}`

### Task 2.2: Scenario Switcher UI
**Files:** `src/components/ScenarioSwitcher.tsx` (new), `src/components/Calculator.tsx`
**Changes:**
- Create ScenarioSwitcher component with pill buttons
- Active scenario: gradient border (`from-emerald-500 to-teal-500`)
- Inactive: `bg-muted/50` with subtle border
- [+ New] button to create fresh scenario
- X button on hover to delete (confirm for active)
- Position above main input in Calculator

### Task 2.3: Auto-save Behavior
**Files:** `src/hooks/useScenarios.ts`, `src/components/Calculator.tsx`
**Changes:**
- Debounce save 1 second after state changes
- Subtle "Saved ✓" indicator that fades after 1.5s
- Auto-save before switching scenarios

---

## Phase 3: Compare Tab Upgrade

### Task 3.1: Scenario Selectors in Compare
**Files:** `src/components/ComparisonView.tsx`
**Changes:**
- Replace left/right state with scenario dropdowns
- Pull options from saved scenarios
- Fallback: if <2 scenarios, show prompt to create another

### Task 3.2: Visual Winner Highlighting
**Files:** `src/components/ComparisonView.tsx`
**Changes:**
- Better value gets subtle green left border
- Add mini bar visualization between values (relative scale)
- Difference shown as both absolute and percentage

### Task 3.3: Verdict Summary Card
**Files:** `src/components/ComparisonView.tsx`
**Changes:**
- Add verdict section below comparison rows
- Natural language summary: "X earns $Y more per year but requires Z more hours"
- Show effective hourly rate comparison

---

## Phase 4: SEO (Minimal)

### Task 4.1: Meta Tags & Open Graph
**Files:** `index.html`
**Changes:**
- Title: "Celery – Freelance Salary Calculator"
- Meta description (natural, not stuffed)
- og:title, og:description, og:image
- twitter:card = summary_large_image

### Task 4.2: JSON-LD Structured Data
**Files:** `index.html`
**Changes:**
- Add WebApplication schema
- Include name, description, applicationCategory

### Task 4.3: Below-the-Fold Content
**Files:** `src/App.tsx`, `src/components/FooterContent.tsx` (new)
**Changes:**
- Add minimal "How it works" section (3 bullets)
- FAQ accordion (3 items, collapsed by default)
- Generous whitespace above, muted styling
- Does NOT compete with calculator

---

## Phase 5: What-If Polish

### Task 5.1: Rate Change Preview
**Files:** `src/components/Calculator.tsx`
**Changes:**
- Show instant "+$X,XXX/yr" preview when changing rate
- Subtle indicator that fades as user types
- Consider ±10% quick buttons next to input

---

## Commands Reference

```bash
bun install          # Install dependencies
bun run dev          # Dev server
bun run build        # Type-check + build
bun run test:run     # Unit tests
bun run test:e2e     # E2E tests
```

---

## Notes

- Keep it clean - the calculator is the hero
- One gradient accent, not five
- SEO content tucked away below the fold
- Test on mobile throughout
