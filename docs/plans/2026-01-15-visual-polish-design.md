# Visual Polish & Scenarios Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Celery into a visually striking, modern calculator with saved scenarios and an upgraded comparison experience - while keeping the interface clean and focused.

**Architecture:** Progressive enhancement of existing components. No structural rewrites - polish what's there, add scenarios layer, upgrade Compare tab.

**Tech Stack:** Existing stack (React 19, Tailwind, shadcn/ui). Add framer-motion for micro-interactions.

---

## Design Principles

1. **The number is the hero** - Everything else supports it
2. **Progressive disclosure** - Advanced features tucked away until needed
3. **Confidence through restraint** - One gradient accent, not five

---

## Part 1: Visual Polish

### 1.1 Result Card Redesign

**Current:** Plain card with stacked numbers
**New:** Gradient hero stripe at top, bold typography, clearer hierarchy

```
┌─────────────────────────────────────┐
│ ▓▓▓▓▓▓▓ gradient stripe ▓▓▓▓▓▓▓▓▓▓ │  <- 4px emerald-to-teal gradient
├─────────────────────────────────────┤
│  🇨🇦 CAD                    Primary │
│                                     │
│  TAKE-HOME                          │  <- text-xs uppercase tracking-wide
│  $127,450                           │  <- text-5xl font-bold, tight tracking
│  $168,000 gross                     │  <- text-lg text-muted-foreground
│                                     │
│  $100/hr × 1,680 hrs                │  <- text-sm
└─────────────────────────────────────┘
```

**Typography specs:**
- Main number: `text-5xl font-bold tracking-tight` (was text-3xl)
- Use `tabular-nums` for all currency values
- Labels: `text-xs uppercase tracking-wide text-muted-foreground`

**Gradient:**
- Positive/take-home: `from-emerald-500 to-teal-500`
- Applied as 4px top border or subtle header bar
- Dark mode: slightly more saturated version

**Shadow:**
- `shadow-xl shadow-black/5` (subtle but present)
- Hover: `shadow-2xl` with smooth transition

### 1.2 Settings Panel Polish

**Current:** Functional collapsibles with chevrons
**New:** Cleaner, more confident styling

- Remove visible borders between sections when collapsed
- Subtle `bg-card/50 backdrop-blur-sm` for glass effect
- Smoother expand/collapse animations (use CSS or framer-motion)
- Active section gets subtle left border accent

### 1.3 Input Styling

**Current:** Standard inputs
**New:** More presence

- Main hourly/salary input: `text-2xl` (up from text-xl), subtle bottom border instead of full border
- Currency selector: pill-style with flag prominent
- Hover states: subtle background shift

### 1.4 Micro-interactions

- **Number changes:** Already have AnimatedNumber - ensure it's smooth (spring physics)
- **Button/chip hover:** `scale-[1.02]` transform, 150ms ease-out
- **Collapsible:** Spring animation for open/close
- **Copied toast:** Fade in/out with subtle slide

---

## Part 2: Saved Scenarios

### 2.1 Data Model

```typescript
interface SavedScenario {
  id: string                    // nanoid
  name: string                  // Auto-generated or user-set
  state: CalculatorState        // Full state snapshot
  createdAt: number
  updatedAt: number
}
```

Storage: localStorage key `celery-scenarios`
Max scenarios: 10 (oldest auto-deleted when exceeded)

### 2.2 Auto-naming

Generate name from state:
- `$${hourlyRate}/hr · ${regionName}` for hourly mode
- `$${targetSalary/1000}k target · ${regionName}` for salary mode
- User can override by clicking to edit

### 2.3 UI: Scenario Switcher

Position: Above the main input, left-aligned

```
[+ New]  [$150/hr · Ontario ✓]  [$85/hr · Remote]  [$200k · California]
```

**Styling:**
- Pills with `rounded-full`
- Active: gradient border (same emerald-teal), filled background
- Inactive: `bg-muted/50` with subtle border
- Hover: slight lift, background shift
- Max visible: 4-5, then "+N more" dropdown

**Interactions:**
- Click to switch (instant, no confirmation)
- Double-click or long-press to rename
- X button on hover to delete (with confirmation for active scenario)
- [+ New] creates fresh scenario with defaults

### 2.4 Auto-save Behavior

- Debounce 1 second after any state change
- Subtle "Saved" indicator (checkmark that fades after 1.5s)
- No explicit save button needed
- If user switches scenarios with unsaved changes, auto-save first

---

## Part 3: Compare Tab Upgrade

### 3.1 Scenario Selectors

Replace hardcoded Left/Right with dropdowns pulling from saved scenarios:

```
┌─────────────────────────────────────────────────────────┐
│  Compare: [▼ $150/hr Ontario]  vs  [▼ $85/hr Remote]   │
└─────────────────────────────────────────────────────────┘
```

Fallback if <2 scenarios: Show current + a "Create second scenario" prompt

### 3.2 Visual Comparison

**Row structure:**
```
┌───────────────┬───────────────┬──────────┐
│   $127,450    │   $98,200     │  +$29k   │
│   take-home   │   take-home   │  +29.6%  │
│   ████████████│██████████░░░░ │  ↑ Left  │  <- mini bar showing relative
└───────────────┴───────────────┴──────────┘
```

**Winner highlighting:**
- Better value gets subtle green left border
- "Winner" badge next to the higher number (subtle, not loud)

### 3.3 Verdict Summary

Below the comparison rows:

```
┌─────────────────────────────────────────────────────────┐
│  📊 VERDICT                                             │
│                                                         │
│  "$150/hr Ontario" earns $29,250 more per year         │
│  but requires 160 more billable hours.                  │
│                                                         │
│  Effective rate: $75.86/hr vs $61.37/hr                │
└─────────────────────────────────────────────────────────┘
```

---

## Part 4: SEO (Minimal & Tucked Away)

### 4.1 Meta Tags

```html
<title>Celery – Freelance Salary Calculator</title>
<meta name="description" content="Convert hourly rates to annual salary with tax estimates for US and Canada. Compare scenarios and see take-home pay instantly." />
```

Open Graph for social sharing:
- og:title, og:description, og:image (create simple OG image)
- twitter:card = summary_large_image

### 4.2 Below-the-Fold Content

**Only visible if user scrolls past calculator.** Clean, minimal.

```
──────────────────────────────────────

How it works
• Enter your hourly rate or target salary
• Adjust your location for accurate tax estimates
• Compare scenarios to find your best option

──────────────────────────────────────

FAQ (collapsed accordion - 3 items max)

▸ How accurate are the tax estimates?
▸ Does this work for W-2 employees?
▸ Is my data stored anywhere?

──────────────────────────────────────
```

**Styling:**
- Generous whitespace above (feels separate from tool)
- Muted text colors
- Accordion items collapsed by default

### 4.3 Structured Data

Add JSON-LD for WebApplication schema:
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Celery",
  "description": "Freelance salary calculator...",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any"
}
```

---

## Part 5: What-If Polish

Not a full feature - just make existing inputs feel more dynamic:

- When changing hourly rate, show instant preview of annual change
- Subtle "+$12,400/yr" indicator that fades as you type
- Consider a quick ±10% button pair next to hourly input for rapid exploration

---

## Implementation Order

1. **Visual polish** (Result card, typography, shadows) - immediate impact
2. **Micro-interactions** (framer-motion, hover states)
3. **Saved scenarios** (data layer, then UI)
4. **Compare upgrade** (scenario selectors, winner highlighting, verdict)
5. **SEO content** (meta tags, below-fold content, structured data)
6. **What-if touches** (rate change preview)

---

## Out of Scope

- Charts/data viz (save for future)
- Export to PDF
- Account/cloud sync
- Additional countries beyond US/CA/MX
