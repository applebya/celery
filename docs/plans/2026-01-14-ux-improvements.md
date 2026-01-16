# Celery UX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Celery from a simple salary calculator into the go-to tool for contractors and job hunters comparing compensation packages.

**Architecture:** Progressive enhancement approach—fix foundational accessibility/mobile issues first, then layer on feature improvements. Each phase builds on the previous, with frequent commits and passing tests at each step.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui (Radix), Vitest, Playwright

---

## Phase 1: Touch Targets & Accessibility Fixes

**Priority:** HIGH | **Effort:** LOW | **Impact:** Critical for mobile users

### Task 1.1: Increase Display Currency Select Touch Target

**Files:**
- Modify: `src/components/Calculator.tsx:239-251`
- Test: `e2e/accessibility.spec.ts`

**Step 1: Update the display currency select trigger size**

In `Calculator.tsx`, find the display currency SelectTrigger (around line 243):

```tsx
// BEFORE:
<SelectTrigger className="w-16 h-6 text-[10px] px-2" aria-label="Select display currency">

// AFTER:
<SelectTrigger className="w-20 h-9 text-xs px-2" aria-label="Select display currency">
```

**Step 2: Run the app and verify visually**

```bash
bun run dev
```
- Open browser, verify select is now larger (36px height minimum)
- Test on mobile viewport (375px width)

**Step 3: Run accessibility tests**

```bash
bun run test:e2e -- accessibility
```
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "fix(a11y): increase display currency select touch target size

Increases h-6 (24px) to h-9 (36px) for better mobile accessibility.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Increase Tab Close Button Touch Target

**Files:**
- Modify: `src/components/ComparisonView.tsx:90-99`

**Step 1: Update the remove scenario button**

In `ComparisonView.tsx`, find the X button (around line 90-98):

```tsx
// BEFORE:
<button
  onClick={(e) => {
    e.stopPropagation()
    removeScenario()
  }}
  className="absolute -top-1 -right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
  title="Remove scenario"
>
  <X className="h-3 w-3" />
</button>

// AFTER:
<button
  onClick={(e) => {
    e.stopPropagation()
    removeScenario()
  }}
  className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
  title="Remove scenario"
  aria-label="Remove scenario"
>
  <X className="h-4 w-4" />
</button>
```

**Step 2: Run app and test hover behavior**

```bash
bun run dev
```
- Enable comparison mode
- Hover over Scenario 2 tab, verify X button is larger and visible

**Step 3: Run E2E tests**

```bash
bun run test:e2e
```
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/ComparisonView.tsx
git commit -m "fix(a11y): increase tab close button touch target

Changes p-0.5 to p-1.5 and h-3 to h-4 for 44px minimum touch target.
Added aria-label and focus:opacity-100 for keyboard accessibility.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 1.3: Increase Title Edit/Save Button Touch Targets

**Files:**
- Modify: `src/components/Calculator.tsx:107-130`

**Step 1: Update the edit and save title buttons**

```tsx
// BEFORE (save button ~line 107):
<button
  onClick={handleTitleSave}
  className="p-1.5 hover:bg-muted rounded-md"
  aria-label="Save title"
>
  <Check className="h-3.5 w-3.5" />
</button>

// AFTER:
<button
  onClick={handleTitleSave}
  className="p-2 hover:bg-muted rounded-md"
  aria-label="Save title"
>
  <Check className="h-4 w-4" />
</button>

// BEFORE (edit button ~line 120):
<button
  onClick={() => {
    setTitleInput(state.title)
    setEditingTitle(true)
  }}
  className="p-1 hover:bg-muted rounded-md opacity-50 hover:opacity-100"
  aria-label="Edit title"
>
  <Pencil className="h-3 w-3" />
</button>

// AFTER:
<button
  onClick={() => {
    setTitleInput(state.title)
    setEditingTitle(true)
  }}
  className="p-2 hover:bg-muted rounded-md opacity-50 hover:opacity-100"
  aria-label="Edit title"
>
  <Pencil className="h-4 w-4" />
</button>
```

**Step 2: Run and verify**

```bash
bun run dev
```
- Enable comparison mode, buttons should be easier to tap

**Step 3: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "fix(a11y): increase title edit/save button touch targets

Standardizes icon buttons to h-4 w-4 with p-2 padding.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Mobile Responsiveness

**Priority:** HIGH | **Effort:** MEDIUM | **Impact:** Critical for mobile users

### Task 2.1: Create Responsive Results Card (Single Column on Mobile)

**Files:**
- Modify: `src/components/Calculator.tsx:180-304`

**Step 1: Add responsive grid classes to results card**

Find the results grid (around line 183):

```tsx
// BEFORE:
<div className="grid grid-cols-2 divide-x">

// AFTER:
<div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-y sm:divide-y-0">
```

**Step 2: Update column padding for mobile stacking**

Primary column (around line 185):
```tsx
// BEFORE:
<div className="p-4 space-y-2">

// AFTER:
<div className="p-4 space-y-2">
```
(No change needed here - padding is fine)

Secondary column (around line 227):
```tsx
// BEFORE:
<div className="p-4 space-y-2 bg-muted/10">

// AFTER:
<div className="p-4 space-y-2 bg-muted/10 border-t sm:border-t-0">
```

**Step 3: Run and test at mobile viewport**

```bash
bun run dev
```
- Open DevTools, set viewport to 375px width
- Verify: Primary currency on top, secondary currency below
- Verify: Horizontal divider appears between columns on mobile
- Verify: At 640px+, layout reverts to side-by-side

**Step 4: Run E2E tests**

```bash
bun run test:e2e
```

**Step 5: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(mobile): stack results columns on small screens

Uses sm: breakpoint (640px) for responsive grid layout.
- Mobile: single column with divide-y
- Desktop: two columns with divide-x

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2.2: Add Mobile-Friendly Labels to Results

**Files:**
- Modify: `src/components/Calculator.tsx:186-224`

**Step 1: Add clearer section headers for mobile view**

Update the primary column header (around line 186-191):

```tsx
// BEFORE:
<div className="flex items-center gap-1.5">
  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
    {state.currency}
  </span>
  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">Primary</Badge>
</div>

// AFTER:
<div className="flex items-center gap-1.5">
  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
    {state.currency}
  </span>
  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 hidden sm:inline-flex">Primary</Badge>
</div>
```

Update the secondary column header similarly (around line 229-238):

```tsx
// BEFORE:
<span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
  {displayCurrency}
</span>

// AFTER:
<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide sm:text-[10px]">
  Also in {displayCurrency}
</span>
```

**Step 2: Run and verify**

```bash
bun run dev
```
- Mobile: Should show "Also in USD" label
- Desktop: Shows just "USD" with compact badge

**Step 3: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(mobile): improve results labels for mobile clarity

- Increases font sizes slightly for readability
- Adds 'Also in' prefix on mobile for context
- Hides 'Primary' badge on mobile to reduce clutter

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2.3: Make Comparison Tabs Scrollable on Mobile

**Files:**
- Modify: `src/components/ComparisonView.tsx:83-105`

**Step 1: Add horizontal scroll container for tabs**

```tsx
// BEFORE:
<div className="flex items-center justify-center gap-2 mb-4">
  <TabsList>

// AFTER:
<div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1 -mb-1">
  <TabsList className="flex-shrink-0">
```

**Step 2: Run and test narrow viewport**

```bash
bun run dev
```
- Set viewport to 320px
- Tabs should scroll horizontally if needed

**Step 3: Commit**

```bash
git add src/components/ComparisonView.tsx
git commit -m "feat(mobile): make comparison tabs scrollable on narrow screens

Adds overflow-x-auto to prevent tab overflow on small devices.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Comparison Mode Enhancement

**Priority:** HIGH | **Effort:** MEDIUM | **Impact:** Key differentiator feature

### Task 3.1: Rename and Elevate "Compare Scenarios" Button

**Files:**
- Modify: `src/components/ComparisonView.tsx:66-75`

**Step 1: Update the comparison button copy and styling**

```tsx
// BEFORE:
<button
  onClick={addScenario}
  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
>
  <Plus className="h-3 w-3" />
  Compare scenarios
</button>

// AFTER:
<button
  onClick={addScenario}
  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors"
>
  <Plus className="h-4 w-4" />
  Compare Job Offers
</button>
```

**Step 2: Run and verify visibility**

```bash
bun run dev
```
- Button should be more prominent with border
- Text should read "Compare Job Offers"

**Step 3: Commit**

```bash
git add src/components/ComparisonView.tsx
git commit -m "feat(comparison): elevate 'Compare Job Offers' button

- Renames from 'Compare scenarios' for clearer value prop
- Adds border and increased padding for visibility
- Uses primary color for emphasis

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3.2: Add Winner Highlighting to Compare Tab

**Files:**
- Modify: `src/components/ComparisonView.tsx:123-155`

**Step 1: Add winner logic and visual indicator**

First, add winner determination after the existing difference calculations (around line 53):

```tsx
// Add after line 53:
const winner = netDifference > 0 ? 'right' : netDifference < 0 ? 'left' : null
```

Then update the comparison cards (around line 126-155):

```tsx
// BEFORE:
<Card>
  <CardContent className="pt-6">
    <h3 className="font-semibold text-center mb-4">{leftState.title || 'Scenario 1'}</h3>

// AFTER:
<Card className={winner === 'left' ? 'ring-2 ring-green-500 ring-offset-2' : ''}>
  <CardContent className="pt-6 relative">
    {winner === 'left' && (
      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white">
        Better Deal
      </Badge>
    )}
    <h3 className="font-semibold text-center mb-4">{leftState.title || 'Scenario 1'}</h3>
```

And similarly for the right card (around line 141):

```tsx
// BEFORE:
<Card>
  <CardContent className="pt-6">
    <h3 className="font-semibold text-center mb-4">{rightState.title || 'Scenario 2'}</h3>

// AFTER:
<Card className={winner === 'right' ? 'ring-2 ring-green-500 ring-offset-2' : ''}>
  <CardContent className="pt-6 relative">
    {winner === 'right' && (
      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white">
        Better Deal
      </Badge>
    )}
    <h3 className="font-semibold text-center mb-4">{rightState.title || 'Scenario 2'}</h3>
```

**Step 2: Run and verify winner badge**

```bash
bun run dev
```
- Add second scenario with different values
- Go to Compare tab
- Higher net income card should have green ring and "Better Deal" badge

**Step 3: Commit**

```bash
git add src/components/ComparisonView.tsx
git commit -m "feat(comparison): add winner highlighting in Compare view

- Determines winner based on net annual income
- Adds green ring around winning card
- Shows 'Better Deal' badge for quick identification

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3.3: Pre-populate Scenario 2 with Variation

**Files:**
- Modify: `src/components/ComparisonView.tsx:30-36`

**Step 1: Update addScenario to copy from Scenario 1 with variation**

```tsx
// BEFORE:
const addScenario = () => {
  onRightChange({
    ...DEFAULT_STATE,
    title: 'New Offer',
  })
  setActiveTab('scenario-2')
}

// AFTER:
const addScenario = () => {
  onRightChange({
    ...leftState,
    title: 'New Offer',
    // Slightly different to demonstrate comparison
    hourlyRate: Math.round(leftState.hourlyRate * 1.1),
  })
  setActiveTab('scenario-2')
}
```

**Step 2: Run and verify pre-population**

```bash
bun run dev
```
- Set Scenario 1 to $100/hr
- Click "Compare Job Offers"
- Scenario 2 should be pre-filled with $110/hr

**Step 3: Commit**

```bash
git add src/components/ComparisonView.tsx
git commit -m "feat(comparison): pre-populate Scenario 2 from current values

Copies current state with 10% rate bump to demonstrate comparison.
Helps users understand the feature immediately.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Progressive Disclosure & Contextual Help

**Priority:** HIGH | **Effort:** HIGH | **Impact:** Reduces cognitive load for new users

### Task 4.1: Create Tooltip Component

**Files:**
- Create: `src/components/ui/tooltip.tsx`

**Step 1: Create the tooltip component**

```bash
bunx shadcn@latest add tooltip
```

Or manually create `src/components/ui/tooltip.tsx`:

```tsx
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-w-xs",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

**Step 2: Install Radix tooltip if needed**

```bash
bun add @radix-ui/react-tooltip
```

**Step 3: Verify build passes**

```bash
bun run build
```

**Step 4: Commit**

```bash
git add src/components/ui/tooltip.tsx package.json bun.lockb
git commit -m "feat(ui): add Tooltip component from shadcn/ui

Radix-based tooltip for contextual help throughout the app.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 4.2: Add Tooltip to Margin Setting

**Files:**
- Modify: `src/components/Calculator.tsx:311-335`

**Step 1: Import tooltip components**

At the top of Calculator.tsx, add:

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
```

**Step 2: Wrap the margin section with tooltip**

Find the Margin collapsible trigger (around line 313-321):

```tsx
// BEFORE:
<CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm">
  <div className="flex items-center gap-2">
    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${openSection === 'currency' ? 'rotate-90' : ''}`} />
    <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
    <span>Margin</span>
  </div>

// AFTER:
<CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm">
  <div className="flex items-center gap-2">
    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${openSection === 'currency' ? 'rotate-90' : ''}`} />
    <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
    <span>Currency Margin</span>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Fee cushion for payment processing, currency conversion, or client payment delays. Contractors typically add 2-5%.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
```

**Step 3: Run and verify tooltip**

```bash
bun run dev
```
- Hover over the (?) icon next to "Currency Margin"
- Tooltip should appear with explanation

**Step 4: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): add tooltip explanation for Currency Margin

- Renames 'Margin' to 'Currency Margin' for clarity
- Adds help icon with tooltip explaining the feature
- Helps new users understand why they might add margin

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 4.3: Add Tooltip to Self-Employed Tax Toggle

**Files:**
- Modify: `src/components/Calculator.tsx` (Tax section, find the isSelfEmployed switch)

**Step 1: Find and update the self-employed toggle**

Locate the self-employed switch in the Tax section and add tooltip:

```tsx
// Find the self-employed switch and update:
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Label htmlFor="selfEmployed" className="text-sm">Self-employed</Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Includes self-employment tax (~15.3% in US, CPP in Canada). Turn off if you're a W-2/T4 employee.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  <Switch
    id="selfEmployed"
    checked={state.isSelfEmployed}
    onCheckedChange={(checked) => updateState({ isSelfEmployed: checked })}
  />
</div>
```

**Step 2: Run and verify**

```bash
bun run dev
```
- Expand Tax section
- Hover over (?) next to "Self-employed"

**Step 3: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): add tooltip for self-employed tax toggle

Explains the ~15.3% self-employment tax impact to help users
choose the correct setting for their situation.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 4.4: Add "Expand All Settings" Button

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1: Add expand all state and handler**

Near the top of the Calculator component (around line 32):

```tsx
// Add new state:
const [allExpanded, setAllExpanded] = useState(false)

// Add handler:
const toggleAllSections = () => {
  if (allExpanded) {
    setOpenSection(null)
  } else {
    setOpenSection('all')
  }
  setAllExpanded(!allExpanded)
}
```

**Step 2: Update toggleSection to work with "all" mode**

```tsx
// Update existing toggleSection:
const toggleSection = (section: string) => {
  if (openSection === 'all') {
    // When all expanded, clicking one collapses to just that one
    setOpenSection(section)
    setAllExpanded(false)
  } else {
    setOpenSection(openSection === section ? null : section)
  }
}

// Update each Collapsible's open prop:
<Collapsible open={openSection === 'currency' || openSection === 'all'} ...>
```

**Step 3: Add the expand/collapse button before settings sections**

Before the settings div (around line 309):

```tsx
<div className="flex justify-end mb-1">
  <button
    onClick={toggleAllSections}
    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors"
  >
    {allExpanded || openSection === 'all' ? 'Collapse all' : 'Expand all settings'}
  </button>
</div>
```

**Step 4: Update all Collapsible open props**

For each of the 5 collapsibles, update the open prop:

```tsx
<Collapsible open={openSection === 'currency' || openSection === 'all'} ...>
<Collapsible open={openSection === 'location' || openSection === 'all'} ...>
<Collapsible open={openSection === 'timeoff' || openSection === 'all'} ...>
<Collapsible open={openSection === 'schedule' || openSection === 'all'} ...>
<Collapsible open={openSection === 'tax' || openSection === 'all'} ...>
```

**Step 5: Run and test**

```bash
bun run dev
```
- Click "Expand all settings" - all 5 sections should expand
- Click "Collapse all" - all should collapse

**Step 6: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): add 'Expand all settings' toggle

Allows users to quickly see all available options at once.
Improves discoverability of advanced features.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: URL Sharing

**Priority:** MEDIUM | **Effort:** MEDIUM | **Impact:** Enables bookmarking and sharing

### Task 5.1: Create URL State Hook

**Files:**
- Create: `src/hooks/useUrlState.ts`

**Step 1: Create the hook**

```tsx
import { useEffect, useCallback } from 'react'
import type { CalculatorState, Currency } from '@/types'
import { DEFAULT_STATE } from '@/types'

const URL_PARAMS = {
  rate: 'r',
  salary: 's',
  currency: 'c',
  country: 'co',
  region: 'rg',
  mode: 'm',
  margin: 'mg',
  selfEmployed: 'se',
} as const

export function encodeStateToUrl(state: CalculatorState): string {
  const params = new URLSearchParams()

  // Only encode non-default values
  if (state.hourlyRate !== DEFAULT_STATE.hourlyRate) {
    params.set(URL_PARAMS.rate, state.hourlyRate.toString())
  }
  if (state.targetSalary !== DEFAULT_STATE.targetSalary) {
    params.set(URL_PARAMS.salary, state.targetSalary.toString())
  }
  if (state.currency !== DEFAULT_STATE.currency) {
    params.set(URL_PARAMS.currency, state.currency)
  }
  if (state.country !== DEFAULT_STATE.country) {
    params.set(URL_PARAMS.country, state.country)
  }
  if (state.region !== DEFAULT_STATE.region) {
    params.set(URL_PARAMS.region, state.region)
  }
  if (state.calculationMode !== DEFAULT_STATE.calculationMode) {
    params.set(URL_PARAMS.mode, state.calculationMode === 'salaryToHourly' ? 'sth' : 'hts')
  }
  if (state.traderMargin !== DEFAULT_STATE.traderMargin) {
    params.set(URL_PARAMS.margin, state.traderMargin.toString())
  }
  if (state.isSelfEmployed !== DEFAULT_STATE.isSelfEmployed) {
    params.set(URL_PARAMS.selfEmployed, state.isSelfEmployed ? '1' : '0')
  }

  const paramString = params.toString()
  return paramString ? `?${paramString}` : ''
}

export function decodeUrlToState(search: string): Partial<CalculatorState> {
  const params = new URLSearchParams(search)
  const state: Partial<CalculatorState> = {}

  const rate = params.get(URL_PARAMS.rate)
  if (rate) state.hourlyRate = parseFloat(rate)

  const salary = params.get(URL_PARAMS.salary)
  if (salary) state.targetSalary = parseFloat(salary)

  const currency = params.get(URL_PARAMS.currency) as Currency
  if (currency && ['CAD', 'USD', 'EUR', 'GBP'].includes(currency)) {
    state.currency = currency
  }

  const country = params.get(URL_PARAMS.country) as 'CA' | 'US'
  if (country && ['CA', 'US'].includes(country)) {
    state.country = country
  }

  const region = params.get(URL_PARAMS.region)
  if (region) state.region = region

  const mode = params.get(URL_PARAMS.mode)
  if (mode === 'sth') state.calculationMode = 'salaryToHourly'

  const margin = params.get(URL_PARAMS.margin)
  if (margin) state.traderMargin = parseFloat(margin)

  const selfEmployed = params.get(URL_PARAMS.selfEmployed)
  if (selfEmployed !== null) state.isSelfEmployed = selfEmployed === '1'

  return state
}

export function useUrlState(
  state: CalculatorState,
  onChange: (state: CalculatorState) => void
) {
  // On mount, check URL for state
  useEffect(() => {
    const urlState = decodeUrlToState(window.location.search)
    if (Object.keys(urlState).length > 0) {
      onChange({ ...state, ...urlState })
    }
  }, []) // Only on mount

  const getShareUrl = useCallback(() => {
    const base = window.location.origin + window.location.pathname
    return base + encodeStateToUrl(state)
  }, [state])

  return { getShareUrl }
}
```

**Step 2: Write tests**

Create `src/hooks/useUrlState.test.ts`:

```tsx
import { describe, it, expect } from 'vitest'
import { encodeStateToUrl, decodeUrlToState } from './useUrlState'
import { DEFAULT_STATE } from '@/types'

describe('useUrlState', () => {
  describe('encodeStateToUrl', () => {
    it('returns empty string for default state', () => {
      expect(encodeStateToUrl(DEFAULT_STATE)).toBe('')
    })

    it('encodes non-default hourly rate', () => {
      const state = { ...DEFAULT_STATE, hourlyRate: 150 }
      expect(encodeStateToUrl(state)).toBe('?r=150')
    })

    it('encodes multiple changed values', () => {
      const state = { ...DEFAULT_STATE, hourlyRate: 150, currency: 'USD' as const }
      const result = encodeStateToUrl(state)
      expect(result).toContain('r=150')
      expect(result).toContain('c=USD')
    })
  })

  describe('decodeUrlToState', () => {
    it('returns empty object for empty search', () => {
      expect(decodeUrlToState('')).toEqual({})
    })

    it('decodes hourly rate', () => {
      expect(decodeUrlToState('?r=150')).toEqual({ hourlyRate: 150 })
    })

    it('decodes currency', () => {
      expect(decodeUrlToState('?c=USD')).toEqual({ currency: 'USD' })
    })

    it('ignores invalid currency', () => {
      expect(decodeUrlToState('?c=INVALID')).toEqual({})
    })
  })
})
```

**Step 3: Run tests**

```bash
bun run test:run -- useUrlState
```
Expected: PASS

**Step 4: Commit**

```bash
git add src/hooks/useUrlState.ts src/hooks/useUrlState.test.ts
git commit -m "feat(sharing): add URL state encoding/decoding hook

- Encodes calculator state to URL params
- Decodes URL params on page load
- Uses short param names (r, c, co, etc.) for compact URLs
- Only encodes non-default values

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 5.2: Add Share Button to Calculator

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1: Import hook and icons**

```tsx
import { useUrlState } from '@/hooks/useUrlState'
import { Share2 } from 'lucide-react'
```

**Step 2: Use the hook in Calculator**

Inside the Calculator component:

```tsx
const { getShareUrl } = useUrlState(state, onChange)

const [copied, setCopied] = useState(false)

const handleShare = async () => {
  const url = getShareUrl()
  await navigator.clipboard.writeText(url)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
```

**Step 3: Add share button after the results card**

After the results Card (around line 304):

```tsx
<div className="flex justify-end">
  <button
    onClick={handleShare}
    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors"
  >
    <Share2 className="h-3.5 w-3.5" />
    {copied ? 'Copied!' : 'Share calculation'}
  </button>
</div>
```

**Step 4: Run and test**

```bash
bun run dev
```
- Change some values
- Click "Share calculation"
- Paste URL - should contain encoded state
- Open URL in new tab - values should be restored

**Step 5: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(sharing): add 'Share calculation' button

- Copies URL with encoded state to clipboard
- Shows 'Copied!' feedback for 2 seconds
- Enables bookmarking and sharing specific calculations

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Visual Feedback & Polish

**Priority:** MEDIUM | **Effort:** LOW | **Impact:** Delightful user experience

### Task 6.1: Add Number Animation on Value Change

**Files:**
- Create: `src/components/AnimatedNumber.tsx`
- Modify: `src/components/Calculator.tsx`

**Step 1: Create AnimatedNumber component**

```tsx
import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  formatter: (n: number) => string
  className?: string
}

export function AnimatedNumber({ value, formatter, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current === value) return

    const start = prevValue.current
    const end = value
    const duration = 300 // ms
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        prevValue.current = value
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return <span className={className}>{formatter(displayValue)}</span>
}
```

**Step 2: Write test**

Create `src/components/AnimatedNumber.test.tsx`:

```tsx
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

**Step 3: Run test**

```bash
bun run test:run -- AnimatedNumber
```

**Step 4: Commit**

```bash
git add src/components/AnimatedNumber.tsx src/components/AnimatedNumber.test.tsx
git commit -m "feat(ui): add AnimatedNumber component

Smooth count-up animation when values change.
Uses requestAnimationFrame with ease-out cubic easing.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 6.2: Use AnimatedNumber in Results Display

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1: Import AnimatedNumber**

```tsx
import { AnimatedNumber } from './AnimatedNumber'
```

**Step 2: Replace static gross annual display**

Find the gross annual display (around line 195-197):

```tsx
// BEFORE:
<p className="text-2xl font-bold tracking-tight leading-none">
  {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })}
</p>

// AFTER:
<p className="text-2xl font-bold tracking-tight leading-none">
  <AnimatedNumber
    value={calculation.grossAnnual}
    formatter={(n) => formatCurrency(n, state.currency, { showCode: false })}
  />
</p>
```

**Step 3: Run and verify animation**

```bash
bun run dev
```
- Change hourly rate
- Watch the gross annual number animate

**Step 4: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ui): animate gross annual value changes

Adds satisfying count-up animation when calculations update.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 6.3: Add Exchange Rate Cache Status Indicator

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1: Update useExchangeRate to expose cache status**

First, check if useExchangeRate already exposes this. If not, we'll add a simple indicator.

In the exchange rate footer (around line 289-301), add cache indicator:

```tsx
// BEFORE:
<div className="px-4 py-2 border-t bg-muted/5 flex items-center justify-between text-[11px] text-muted-foreground">

// AFTER:
<div className="px-4 py-2 border-t bg-muted/5 flex items-center justify-between text-[11px] text-muted-foreground">
  <div className="flex items-center gap-1.5">
    <ArrowRightLeft className="h-3 w-3" />
    <span>
      1 {state.currency} = {rateWithMargin.toFixed(4)} {displayCurrency}
      {state.traderMargin > 0 && (
        <span className="opacity-60"> ({state.traderMargin}% margin)</span>
      )}
    </span>
    {!exchangeRates && (
      <span className="text-amber-500" title="Using cached exchange rate">
        (cached)
      </span>
    )}
  </div>
```

**Step 2: Run and verify**

```bash
bun run dev
```
- If offline or rates fail, should show "(cached)" indicator

**Step 3: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): add cache status indicator for exchange rates

Shows '(cached)' label when using fallback rates.
Helps users understand when rates may be stale.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 7: Results Hierarchy Improvement

**Priority:** HIGH | **Effort:** LOW | **Impact:** Clarity for new users

### Task 7.1: Make Net Annual the Hero Number

**Files:**
- Modify: `src/components/Calculator.tsx:193-223`

**Step 1: Restructure the results display to emphasize net income**

```tsx
// BEFORE (hourlyToSalary mode, around line 193-207):
<div className="space-y-1">
  <p className="text-2xl font-bold tracking-tight leading-none">
    {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })}
  </p>
  {state.showTaxEstimate && (
    <p className="text-base font-medium text-green-600 dark:text-green-400">
      {formatCurrency(calculation.netAnnual, state.currency, { showCode: false })}
      <span className="text-xs text-muted-foreground ml-1">net</span>
    </p>
  )}
  <p className="text-sm text-muted-foreground">
    {formatCurrency(state.hourlyRate, state.currency, { showCode: false })}/hr
  </p>
</div>

// AFTER:
<div className="space-y-1">
  {state.showTaxEstimate ? (
    <>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">Take-home</p>
      <p className="text-2xl font-bold tracking-tight leading-none text-green-600 dark:text-green-400">
        <AnimatedNumber
          value={calculation.netAnnual}
          formatter={(n) => formatCurrency(n, state.currency, { showCode: false })}
        />
      </p>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(calculation.grossAnnual, state.currency, { showCode: false })} gross
      </p>
    </>
  ) : (
    <>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual</p>
      <p className="text-2xl font-bold tracking-tight leading-none">
        <AnimatedNumber
          value={calculation.grossAnnual}
          formatter={(n) => formatCurrency(n, state.currency, { showCode: false })}
        />
      </p>
    </>
  )}
  <p className="text-xs text-muted-foreground">
    {formatCurrency(state.hourlyRate, state.currency, { showCode: false })}/hr × {calculation.billableHours.toLocaleString()} hrs
  </p>
</div>
```

**Step 2: Run and verify hierarchy**

```bash
bun run dev
```
- With tax estimate on: Net (green, largest) → Gross (smaller) → Hourly (smallest)
- With tax estimate off: Gross (largest) → Hourly (smallest)

**Step 3: Commit**

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): make net income the hero number when tax shown

- 'Take-home' label with net income as largest, green value
- Gross shown as secondary context
- Hourly rate shown as calculation detail
- Clearer visual hierarchy for what matters most

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary Checklist

### Phase 1: Touch Targets (3 tasks)
- [ ] 1.1: Display currency select → h-9
- [ ] 1.2: Tab close button → p-1.5, h-4
- [ ] 1.3: Title edit/save buttons → p-2, h-4

### Phase 2: Mobile Responsiveness (3 tasks)
- [ ] 2.1: Responsive results card (stack on mobile)
- [ ] 2.2: Mobile-friendly result labels
- [ ] 2.3: Scrollable comparison tabs

### Phase 3: Comparison Mode (3 tasks)
- [ ] 3.1: Elevate "Compare Job Offers" button
- [ ] 3.2: Add winner highlighting
- [ ] 3.3: Pre-populate Scenario 2

### Phase 4: Progressive Disclosure (4 tasks)
- [ ] 4.1: Create Tooltip component
- [ ] 4.2: Add tooltip to Margin
- [ ] 4.3: Add tooltip to Self-employed
- [ ] 4.4: Add "Expand all settings" button

### Phase 5: URL Sharing (2 tasks)
- [ ] 5.1: Create useUrlState hook
- [ ] 5.2: Add "Share calculation" button

### Phase 6: Visual Feedback (3 tasks)
- [ ] 6.1: Create AnimatedNumber component
- [ ] 6.2: Use in results display
- [ ] 6.3: Add cache status indicator

### Phase 7: Results Hierarchy (1 task)
- [ ] 7.1: Make net income hero number

---

**Total: 19 tasks across 7 phases**

**Estimated commits: ~19-25**

**Testing checkpoints:**
- After Phase 1: Run `bun run test:e2e -- accessibility`
- After Phase 2: Manual mobile viewport testing
- After Phase 3: Full E2E test suite
- After Phase 5: Unit tests for URL encoding
- Final: Full test suite + manual QA
