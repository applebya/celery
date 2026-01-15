# Layout and UX Overhaul - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Celery into a two-panel desktop layout with improved readability, consolidated settings, and better comparison UX.

**Architecture:** Restructure Calculator component to split into InputPanel and ResultsPanel. Add state for currency conversion toggle. Consolidate Location + Time Off into Work Schedule section. Redesign ComparisonView with horizontal metric rows.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui components

---

## Phase 1: Desktop Two-Panel Layout

### Task 1.1: Add `showCurrencyConversion` to CalculatorState

**Files:**
- Modify: `src/types.ts`

**Step 1:** Add the new field to CalculatorState interface (after line 24):

```typescript
// In CalculatorState interface, add:
  // Toggle to show/hide currency conversion column
  showCurrencyConversion: boolean
```

**Step 2:** Add default value to DEFAULT_STATE (after line 54):

```typescript
  showCurrencyConversion: true,
```

**Step 3:** Run build to verify:

```bash
bun run build
```

**Step 4:** Commit:

```bash
git add src/types.ts
git commit -m "feat(state): add showCurrencyConversion toggle to state

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Create Two-Panel Layout Structure in Calculator

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1:** Restructure the component's return to use a two-panel grid layout. Replace the outer `<div className="space-y-3">` with:

```tsx
return (
  <div className="grid grid-cols-1 md:grid-cols-[1fr,1.2fr] gap-4 md:gap-6">
    {/* Left Panel - Inputs */}
    <div className="space-y-3">
      {/* Title editing (if showTitle) */}
      {showTitle && (
        // ... existing title editing JSX
      )}

      {/* Main Input */}
      {/* ... existing input with mode toggle */}

      {/* Settings Sections */}
      {/* ... existing collapsible sections */}
    </div>

    {/* Right Panel - Results */}
    <div className="md:sticky md:top-4 md:self-start space-y-3">
      {/* Results Card */}
      {/* ... move results card here */}

      {/* Share button */}
      {/* Exchange Rate Display */}
    </div>
  </div>
)
```

**Step 2:** Move these elements to the right panel:
- Results Card (lines 214-367)
- Share button (lines 369-377)
- ExchangeRateDisplay (line 380)

**Step 3:** Keep these in the left panel:
- Title editing
- Main input with currency selector
- All collapsible settings sections

**Step 4:** Run and verify layout:

```bash
bun run dev
```
- On desktop (≥768px): Side-by-side panels
- On mobile: Stacked (inputs first, then results)

**Step 5:** Commit:

```bash
git add src/components/Calculator.tsx
git commit -m "feat(layout): restructure Calculator into two-panel desktop layout

- Inputs on left, results on right (md breakpoint)
- Results panel sticky on desktop
- Stacks vertically on mobile

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 1.3: Wire Up Currency Conversion Toggle

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1:** In the results card, wrap the display currency column with the toggle condition:

```tsx
{/* Display Currency Column - only show if enabled */}
{state.showCurrencyConversion && state.currency !== displayCurrency && (
  <div className="p-4 space-y-2 bg-muted/10">
    {/* ... existing display currency content */}
  </div>
)}
```

**Step 2:** Update the grid layout to be responsive to the toggle:

```tsx
<div className={`grid ${state.showCurrencyConversion && state.currency !== displayCurrency ? 'grid-cols-1 sm:grid-cols-2 sm:divide-x' : 'grid-cols-1'} divide-y sm:divide-y-0`}>
```

**Step 3:** Run and verify:

```bash
bun run dev
```
- Toggle should show/hide the second currency column

**Step 4:** Commit:

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): wire up currency conversion toggle

Column hides completely when toggle is off.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Currency Settings Section

### Task 2.1: Create Currency Settings Section with Toggle

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1:** Rename "Currency Margin" section to "Currency Settings" and restructure. Replace the existing Currency & Margin collapsible (lines 392-426) with:

```tsx
{/* Currency Settings */}
<Collapsible open={openSection === 'currency' || openSection === 'all'} onOpenChange={() => toggleSection('currency')}>
  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-base">
    <div className="flex items-center gap-2">
      <ChevronRight className={`h-4 w-4 transition-transform ${openSection === 'currency' || openSection === 'all' ? 'rotate-90' : ''}`} />
      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
      <span>Currency Settings</span>
    </div>
    <span className="text-sm text-muted-foreground">
      {state.showCurrencyConversion
        ? `${CURRENCY_FLAGS[displayCurrency]} ${displayCurrency} · ${state.traderMargin}%`
        : 'Disabled'}
    </span>
  </CollapsibleTrigger>
  <CollapsibleContent className="px-3 pb-3 space-y-3">
    {/* Master Toggle */}
    <div className="flex items-center justify-between">
      <Label htmlFor="showConversion" className="text-base">Show currency conversion</Label>
      <Switch
        id="showConversion"
        checked={state.showCurrencyConversion}
        onCheckedChange={(checked) => updateState({ showCurrencyConversion: checked })}
      />
    </div>

    {state.showCurrencyConversion && (
      <>
        {/* Display Currency Selector */}
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">Display Currency</Label>
          <Select
            value={displayCurrency}
            onValueChange={(v) => updateState({ displayCurrency: v as Currency })}
          >
            <SelectTrigger className="h-10 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.filter(c => c.value !== state.currency).map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {CURRENCY_FLAGS[c.value]} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Margin section will be added in next task */}
      </>
    )}
  </CollapsibleContent>
</Collapsible>
```

**Step 2:** Add CURRENCY_FLAGS constant at the top of the file (after CURRENCIES):

```tsx
const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: '🇺🇸',
  CAD: '🇨🇦',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
}
```

**Step 3:** Run and verify:

```bash
bun run dev
```

**Step 4:** Commit:

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): create Currency Settings section with toggle

- Master toggle to enable/disable conversion
- Display currency selector with emoji flags
- Collapsed summary shows status

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2.2: Add Margin Presets Chips

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1:** Add margin presets constant after CURRENCY_FLAGS:

```tsx
const MARGIN_PRESETS = [
  { label: 'Wise', value: 0.5 },
  { label: 'Bank', value: 2.5 },
  { label: 'PayPal', value: 3.5 },
] as const
```

**Step 2:** Inside the Currency Settings CollapsibleContent, after the display currency selector, add:

```tsx
{/* Conversion Margin */}
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Label className="text-sm text-muted-foreground">Conversion Margin</Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Fee cushion for payment processing, currency conversion, or client payment delays. Contractors typically add 2-5%.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>

  {/* Preset Chips */}
  <div className="flex flex-wrap gap-2">
    {MARGIN_PRESETS.map((preset) => (
      <button
        key={preset.label}
        onClick={() => updateState({ traderMargin: preset.value })}
        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
          state.traderMargin === preset.value
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-muted/50 hover:bg-muted border-transparent'
        }`}
      >
        {preset.label}
      </button>
    ))}
    <button
      onClick={() => {/* Custom is just visual indicator */}}
      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
        !MARGIN_PRESETS.some(p => p.value === state.traderMargin)
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-muted/50 hover:bg-muted border-transparent'
      }`}
    >
      Custom
    </button>
  </div>

  {/* Slider */}
  <div className="flex items-center gap-3">
    <Slider
      value={[state.traderMargin]}
      onValueChange={([value]) => updateState({ traderMargin: value })}
      max={10}
      step={0.5}
      className="flex-1"
    />
    <span className="text-base font-medium tabular-nums w-12 text-right">{state.traderMargin}%</span>
  </div>
</div>
```

**Step 3:** Run and verify:

```bash
bun run dev
```
- Clicking a preset chip should set the slider value
- Moving slider should auto-select "Custom" chip

**Step 4:** Commit:

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): add margin preset chips (Wise, Bank, PayPal)

- Quick-select common margin values
- Custom chip shows when slider manually adjusted

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Work Schedule Consolidation

### Task 3.1: Create Consolidated Work Schedule Section

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1:** Remove the separate Location, Time Off, and Schedule sections. Replace them with a single consolidated section:

```tsx
{/* Work Schedule */}
<Collapsible open={openSection === 'schedule' || openSection === 'all'} onOpenChange={() => toggleSection('schedule')}>
  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-base border-t">
    <div className="flex items-center gap-2">
      <ChevronRight className={`h-4 w-4 transition-transform ${openSection === 'schedule' || openSection === 'all' ? 'rotate-90' : ''}`} />
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span>Work Schedule</span>
    </div>
    <span className="text-sm text-muted-foreground">
      {currentCountry?.flag} {state.region} · {state.holidaysPerYear + (state.unlimitedPTO ? 0 : state.ptoDays + state.sickDays)} days off
    </span>
  </CollapsibleTrigger>
  <CollapsibleContent className="px-3 pb-3 space-y-4">
    {/* Location Row */}
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Country</Label>
        <Select value={state.country} onValueChange={handleCountryChange}>
          <SelectTrigger className="h-10 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.flag} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Region</Label>
        <Select value={state.region} onValueChange={handleRegionChange}>
          <SelectTrigger className="h-10 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentCountry?.regions.map((r) => (
              <SelectItem key={r.code} value={r.code}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Time Off Grid */}
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Holidays</Label>
        <Input
          type="number"
          min={0}
          max={20}
          value={state.holidaysPerYear || ''}
          onChange={(e) => updateState({ holidaysPerYear: parseInt(e.target.value) || 0 })}
          className="h-10 text-base"
        />
        <span className="text-xs text-muted-foreground">public</span>
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">PTO</Label>
        <Input
          type="number"
          min={0}
          max={60}
          value={state.ptoDays || ''}
          onChange={(e) => updateState({ ptoDays: parseInt(e.target.value) || 0 })}
          className="h-10 text-base"
          disabled={state.unlimitedPTO}
        />
        <span className="text-xs text-muted-foreground">vacation</span>
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Sick Days</Label>
        <Input
          type="number"
          min={0}
          max={30}
          value={state.sickDays || ''}
          onChange={(e) => updateState({ sickDays: parseInt(e.target.value) || 0 })}
          className="h-10 text-base"
          disabled={state.unlimitedPTO}
        />
        <span className="text-xs text-muted-foreground">personal</span>
      </div>
    </div>

    {/* Paid PTO Toggle */}
    <div className="flex items-center justify-between">
      <Label htmlFor="unlimitedPTO" className="text-base">Employer provides paid time off</Label>
      <Switch
        id="unlimitedPTO"
        checked={state.unlimitedPTO}
        onCheckedChange={(checked) => updateState({ unlimitedPTO: checked })}
      />
    </div>

    {/* Hours Per Week */}
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Hours/Day</Label>
        <Input
          type="number"
          min={1}
          max={16}
          value={state.hoursPerDay || ''}
          onChange={(e) => updateState({ hoursPerDay: parseInt(e.target.value) || 8 })}
          className="h-10 text-base"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-muted-foreground">Days/Week</Label>
        <Input
          type="number"
          min={1}
          max={7}
          value={state.daysPerWeek || ''}
          onChange={(e) => updateState({ daysPerWeek: parseInt(e.target.value) || 5 })}
          className="h-10 text-base"
        />
      </div>
    </div>

    {/* Summary */}
    <div className="pt-2 border-t text-base text-muted-foreground">
      {calculation.billableHours.toLocaleString()} billable hours/year
    </div>
  </CollapsibleContent>
</Collapsible>
```

**Step 2:** Remove the old Location (lines 428-477), Time Off (lines 479-527), and Schedule (lines 529-567) collapsibles.

**Step 3:** Run and verify:

```bash
bun run dev
```

**Step 4:** Commit:

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): consolidate Location, Time Off, Schedule into Work Schedule

- Single section for all 'how much do I work' settings
- 3-column time-off grid (Holidays, PTO, Sick)
- Shows billable hours summary

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Font Size Updates

### Task 4.1: Update All Font Sizes to 16px Minimum

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1:** Find and replace small font sizes throughout the file:

```
text-xs → text-base (or text-sm where appropriate)
text-[10px] → text-sm
text-[11px] → text-base
text-[9px] → text-sm
text-sm → text-base (in most places)
text-2xl → text-3xl (for hero numbers)
```

**Key changes:**
- Input labels: text-base
- Result labels: text-base
- Result hero values: text-3xl
- Secondary values: text-lg
- Settings text: text-base
- Badge text: text-sm
- Exchange rate footer: text-base

**Step 2:** Update icon sizes proportionally:

```
h-3 w-3 → h-4 w-4
h-3.5 w-3.5 → h-4 w-4
```

**Step 3:** Update padding/spacing where needed for the larger text.

**Step 4:** Run and verify readability:

```bash
bun run dev
```

**Step 5:** Commit:

```bash
git add src/components/Calculator.tsx
git commit -m "feat(a11y): bump all font sizes to 16px minimum

- Hero numbers now text-3xl (30px)
- All labels and body text at least text-base (16px)
- Icons scaled proportionally

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 4.2: Update Font Sizes in ComparisonView

**Files:**
- Modify: `src/components/ComparisonView.tsx`

**Step 1:** Update font sizes in the comparison cards and summary:

```
text-xs → text-base
text-sm → text-lg
text-2xl → text-3xl
```

**Step 2:** Run and verify:

```bash
bun run dev
```

**Step 3:** Commit:

```bash
git add src/components/ComparisonView.tsx
git commit -m "feat(a11y): update ComparisonView font sizes to 16px minimum

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: Currency Flags

### Task 5.1: Add Flags to All Currency Displays

**Files:**
- Modify: `src/components/Calculator.tsx`

**Step 1:** Update the main currency selector to show flags:

```tsx
<Select value={state.currency} onValueChange={(v) => updateState({ currency: v as Currency })}>
  <SelectTrigger className="w-24 h-11" aria-label="Select currency">
    <SelectValue>
      {CURRENCY_FLAGS[state.currency]} {state.currency}
    </SelectValue>
  </SelectTrigger>
  <SelectContent>
    {CURRENCIES.map((c) => (
      <SelectItem key={c.value} value={c.value}>
        {CURRENCY_FLAGS[c.value]} {c.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Step 2:** Update result headers to show flags:

```tsx
{/* Main Currency Column header */}
<span className="text-base font-medium text-muted-foreground uppercase tracking-wide">
  {CURRENCY_FLAGS[state.currency]} {state.currency}
</span>

{/* Display Currency Column header */}
<span className="text-base font-medium text-muted-foreground uppercase tracking-wide">
  {CURRENCY_FLAGS[displayCurrency]} {displayCurrency}
</span>
```

**Step 3:** Run and verify flags appear everywhere:

```bash
bun run dev
```

**Step 4:** Commit:

```bash
git add src/components/Calculator.tsx
git commit -m "feat(ux): add emoji flags to all currency displays

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Comparison View Redesign

### Task 6.1: Redesign ComparisonView with Horizontal Rows

**Files:**
- Modify: `src/components/ComparisonView.tsx`

**Step 1:** Replace the side-by-side cards (lines 130-172) with a horizontal row layout:

```tsx
<TabsContent value="compare" className="space-y-4">
  {/* Header Row */}
  <div className="grid grid-cols-[1fr,1fr,auto] gap-4 text-center">
    <div className="font-semibold text-lg">{leftState.title || 'Scenario 1'}</div>
    <div className="font-semibold text-lg">{rightState.title || 'Scenario 2'}</div>
    <div className="w-20"></div>
  </div>

  {/* Gross Annual Row */}
  <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center py-3 border-b">
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Gross Annual</p>
      <p className="text-2xl font-bold tabular-nums">
        {formatCurrency(leftCalc.grossAnnual, leftState.currency)}
      </p>
    </div>
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Gross Annual</p>
      <p className="text-2xl font-bold tabular-nums">
        {formatCurrency(rightCalc.grossAnnual, rightState.currency)}
      </p>
    </div>
    <div className="w-20 text-right">
      <span className={`text-sm font-medium ${
        rightCalc.grossAnnual >= leftCalc.grossAnnual ? 'text-green-600' : 'text-red-600'
      }`}>
        {rightCalc.grossAnnual >= leftCalc.grossAnnual ? '+' : ''}
        {(((rightCalc.grossAnnual - leftCalc.grossAnnual) / leftCalc.grossAnnual) * 100).toFixed(1)}%
      </span>
    </div>
  </div>

  {/* Net Annual Row */}
  <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center py-3 border-b">
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Net Annual (Take-home)</p>
      <p className={`text-3xl font-bold tabular-nums ${winner === 'left' ? 'text-green-600' : ''}`}>
        {formatCurrency(leftCalc.netAnnual, leftState.currency)}
        {winner === 'left' && <span className="ml-2 text-sm">●</span>}
      </p>
    </div>
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Net Annual (Take-home)</p>
      <p className={`text-3xl font-bold tabular-nums ${winner === 'right' ? 'text-green-600' : ''}`}>
        {formatCurrency(rightCalc.netAnnual, rightState.currency)}
        {winner === 'right' && <span className="ml-2 text-sm">●</span>}
      </p>
    </div>
    <div className="w-20 text-right">
      <span className={`text-sm font-medium ${
        netDifference >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {netPercentChange >= 0 ? '+' : ''}{netPercentChange.toFixed(1)}%
      </span>
    </div>
  </div>

  {/* Effective Hourly Row */}
  <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center py-3 border-b">
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Effective Hourly</p>
      <p className="text-xl font-bold tabular-nums">
        {formatCurrency(leftCalc.netAnnual / leftCalc.billableHours, leftState.currency)}/hr
      </p>
    </div>
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Effective Hourly</p>
      <p className="text-xl font-bold tabular-nums">
        {formatCurrency(rightCalc.netAnnual / rightCalc.billableHours, rightState.currency)}/hr
      </p>
    </div>
    <div className="w-20 text-right">
      <span className={`text-sm font-medium ${
        (rightCalc.netAnnual / rightCalc.billableHours) >= (leftCalc.netAnnual / leftCalc.billableHours)
          ? 'text-green-600' : 'text-red-600'
      }`}>
        {((rightCalc.netAnnual / rightCalc.billableHours) >= (leftCalc.netAnnual / leftCalc.billableHours) ? '+' : '')}
        {((((rightCalc.netAnnual / rightCalc.billableHours) - (leftCalc.netAnnual / leftCalc.billableHours)) / (leftCalc.netAnnual / leftCalc.billableHours)) * 100).toFixed(1)}%
      </span>
    </div>
  </div>

  {/* Hours/Year Row */}
  <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center py-3 border-b">
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Hours/Year</p>
      <p className="text-lg font-medium tabular-nums">
        {leftCalc.billableHours.toLocaleString()}
      </p>
    </div>
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Hours/Year</p>
      <p className="text-lg font-medium tabular-nums">
        {rightCalc.billableHours.toLocaleString()}
      </p>
    </div>
    <div className="w-20 text-right">
      <span className={`text-sm font-medium ${
        rightCalc.billableHours <= leftCalc.billableHours ? 'text-green-600' : 'text-red-600'
      }`}>
        {rightCalc.billableHours <= leftCalc.billableHours ? '' : '+'}
        {(((rightCalc.billableHours - leftCalc.billableHours) / leftCalc.billableHours) * 100).toFixed(1)}%
      </span>
    </div>
  </div>

  {/* Verdict */}
  <Card className="bg-muted/50">
    <CardContent className="py-4 text-center">
      <p className="text-lg">
        <span className="font-semibold">{winner === 'right' ? (rightState.title || 'Scenario 2') : (leftState.title || 'Scenario 1')}</span>
        {' pays '}
        <span className="font-bold text-green-600">
          {formatCurrency(Math.abs(netDifference), leftState.currency)}
        </span>
        {' more annually (net)'}
      </p>
    </CardContent>
  </Card>
</TabsContent>
```

**Step 2:** Run and verify alignment:

```bash
bun run dev
```
- Numbers should align horizontally across scenarios
- Percentage diffs on the right

**Step 3:** Commit:

```bash
git add src/components/ComparisonView.tsx
git commit -m "feat(ux): redesign comparison view with horizontal rows

- Each metric is a row for easy left-to-right comparison
- Aligned columns with tabular-nums
- Winner indicator on higher net value
- Plain-English verdict

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 7: Final Polish

### Task 7.1: Run Full Test Suite and Fix Any Breaks

**Files:**
- May modify test files or components based on failures

**Step 1:** Run all tests:

```bash
bun run test:run
```

**Step 2:** Run build:

```bash
bun run build
```

**Step 3:** Run E2E tests:

```bash
bun run test:e2e
```

**Step 4:** Fix any failures.

**Step 5:** Commit fixes if any:

```bash
git add -A
git commit -m "fix: resolve test failures from UX overhaul

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 7.2: Update URL State Hook for New Field

**Files:**
- Modify: `src/hooks/useUrlState.ts`

**Step 1:** Add `showCurrencyConversion` to URL encoding:

```typescript
// Add to URL_PARAMS
showCurrencyConversion: 'sc',

// Add to encodeStateToUrl (only encode if false, since true is default)
if (!state.showCurrencyConversion) result.append(URL_PARAMS.showCurrencyConversion, '0')

// Add to decodeUrlToState
case URL_PARAMS.showCurrencyConversion:
  result.showCurrencyConversion = value !== '0'
  break
```

**Step 2:** Run tests:

```bash
bun run test:run
```

**Step 3:** Commit:

```bash
git add src/hooks/useUrlState.ts
git commit -m "feat(sharing): include showCurrencyConversion in URL state

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 8: Mexican Peso Support

### Task 8.1: Add MXN Currency

**Files:**
- Modify: `src/types.ts`
- Modify: `src/components/Calculator.tsx`

**Step 1:** Update Currency type in `src/types.ts`:

```typescript
export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'MXN'
```

**Step 2:** Add MXN to CURRENCIES array in Calculator.tsx:

```tsx
const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'CAD', label: 'CAD', symbol: 'C$' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
  { value: 'MXN', label: 'MXN', symbol: '$' },
]
```

**Step 3:** Add MXN to CURRENCY_FLAGS:

```tsx
const CURRENCY_FLAGS: Record<Currency, string> = {
  USD: '🇺🇸',
  CAD: '🇨🇦',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  MXN: '🇲🇽',
}
```

**Step 4:** Update exchange rate hook to include MXN in `src/hooks/useExchangeRate.ts`:

```typescript
// Update FALLBACK_RATES
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  CAD: 1.36,
  EUR: 0.92,
  GBP: 0.79,
  MXN: 17.2,
}

// Update API call to include MXN
const response = await fetch(
  'https://api.frankfurter.app/latest?from=USD&to=CAD,EUR,GBP,MXN'
)
```

**Step 5:** Run and verify:

```bash
bun run dev
```

**Step 6:** Commit:

```bash
git add src/types.ts src/components/Calculator.tsx src/hooks/useExchangeRate.ts
git commit -m "feat(currency): add Mexican Peso (MXN) support

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 8.2: Add Mexico to Holidays Data

**Files:**
- Modify: `src/data/holidays-2026.ts`

**Step 1:** Add Mexico country data with states and holidays:

```typescript
{
  code: 'MX' as const,
  name: 'Mexico',
  flag: '🇲🇽',
  currency: 'MXN' as Currency,
  regions: [
    { code: 'CDMX', name: 'Ciudad de México', holidays: 7 },
    { code: 'JAL', name: 'Jalisco', holidays: 7 },
    { code: 'NL', name: 'Nuevo León', holidays: 7 },
    { code: 'QRO', name: 'Querétaro', holidays: 7 },
    { code: 'YUC', name: 'Yucatán', holidays: 7 },
    { code: 'AGS', name: 'Aguascalientes', holidays: 7 },
    { code: 'BC', name: 'Baja California', holidays: 7 },
    { code: 'GTO', name: 'Guanajuato', holidays: 7 },
  ],
}
```

Mexico has 7 mandatory federal holidays (días de descanso obligatorio).

**Step 2:** Update country type to include 'MX':

```typescript
// Update type
export type CountryCode = 'CA' | 'US' | 'MX'
```

**Step 3:** Update Calculator to handle MX country:

```typescript
// In handleCountryChange
const handleCountryChange = useCallback(
  (country: 'CA' | 'US' | 'MX') => {
    const countryData = getCountry(country)
    const defaultRegion = country === 'CA' ? 'ON' : country === 'US' ? 'CA' : 'CDMX'
    const holidays = getHolidayCount(country, defaultRegion)
    updateState({
      country,
      region: defaultRegion,
      currency: countryData?.currency ?? 'CAD',
      holidaysPerYear: holidays,
    })
  },
  [updateState]
)
```

**Step 4:** Update CalculatorState type:

```typescript
country: 'CA' | 'US' | 'MX'
```

**Step 5:** Run tests and fix any type errors:

```bash
bun run test:run
```

**Step 6:** Commit:

```bash
git add src/data/holidays-2026.ts src/types.ts src/components/Calculator.tsx
git commit -m "feat(i18n): add Mexico with states and holidays

- 7 mandatory federal holidays
- 8 major states included
- MXN auto-selected when Mexico chosen

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary Checklist

- [ ] Task 1.1: Add showCurrencyConversion to state
- [ ] Task 1.2: Create two-panel layout structure
- [ ] Task 1.3: Wire up currency conversion toggle
- [ ] Task 2.1: Create Currency Settings section with toggle
- [ ] Task 2.2: Add margin preset chips
- [ ] Task 3.1: Consolidate Work Schedule section
- [ ] Task 4.1: Update Calculator font sizes
- [ ] Task 4.2: Update ComparisonView font sizes
- [ ] Task 5.1: Add flags to currency displays
- [ ] Task 6.1: Redesign ComparisonView with horizontal rows
- [ ] Task 7.1: Run tests and fix breaks
- [ ] Task 7.2: Update URL state for new field
- [ ] Task 8.1: Add MXN currency
- [ ] Task 8.2: Add Mexico to holidays data

---

## Future: PostHog Analytics

For tracking user behavior (currencies used, locations, etc.), consider adding PostHog in a future iteration:
- Track currency selections
- Track country/region selections
- Track comparison usage
- Track share button clicks
- A/B test UI changes
