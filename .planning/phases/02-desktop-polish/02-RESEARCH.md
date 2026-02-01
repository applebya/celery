# Phase 2: Desktop Polish - Research

**Researched:** 2026-02-01
**Domain:** Desktop responsive layout, two-column grid patterns, whitespace systems
**Confidence:** HIGH

## Summary

Desktop polish for calculator/dashboard applications centers on **two-column layouts** with inputs on the left and results on the right, taking advantage of horizontal space on screens wider than 768px. The established pattern uses CSS Grid with proportional column sizing (fr units), generous whitespace following the 8px grid system, and sticky positioning for results panels.

The current Celery implementation already uses Tailwind CSS 4 with shadcn/ui components and has a grid-based layout at line 278 of Calculator.tsx (`grid-cols-1 lg:grid-cols-[1fr,380px]`). The research confirms this approach aligns with 2026 best practices, with opportunities to enhance spacing, visual hierarchy, and column proportions for a more professional desktop experience.

**Key findings:**

- 768px is the industry-standard breakpoint for desktop layouts (tablets and up)
- Column proportions typically range from 40/60 to 50/50, with results column often narrower (300-400px fixed or 1fr)
- Spacing scale: Tailwind's default spacing (4px base unit) is already generous, with p-6 (24px) standard for card padding
- Sticky positioning with `lg:sticky lg:top-4 lg:self-start` keeps results visible during scroll
- Visual hierarchy achieved through typography scale, whitespace proximity, and consistent spacing (not decoration)

**Primary recommendation:** Use CSS Grid with `lg:grid-cols-[1fr,400px]` or `lg:grid-cols-[2fr,1fr]` for desktop, increase spacing from current `gap-4 lg:gap-6` to `gap-6 lg:gap-8 xl:gap-12`, and maintain sticky results panel. Avoid max-width containers to allow fluid expansion on ultrawide monitors.

## Standard Stack

The established libraries/tools for desktop-polished React layouts in 2026:

### Core

| Library           | Version | Purpose                       | Why Standard                                                                                    |
| ----------------- | ------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Tailwind CSS      | 4.1+    | Utility-first CSS framework   | Industry standard for responsive layouts, built-in spacing scale (4px base), CSS Grid utilities |
| @tailwindcss/vite | 4.1+    | Vite plugin for Tailwind v4   | Required for Tailwind CSS 4, replaces PostCSS approach                                          |
| CSS Grid          | Native  | Two-dimensional layout system | Preferred over Flexbox for complex page-level layouts with rows and columns                     |

### Supporting

| Library       | Version | Purpose                       | When to Use                                                                               |
| ------------- | ------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| shadcn/ui     | Latest  | Radix-based component library | Already in use, Card component with p-6 (24px) default padding aligns with best practices |
| Radix UI      | 1.x     | Headless primitives           | Foundational for shadcn/ui, provides accessible interactive components                    |
| Framer Motion | 12.x    | Animation library             | Already in use for AnimatedNumber, optional for layout transitions                        |

### Alternatives Considered

| Instead of       | Could Use            | Tradeoff                                                                                                        |
| ---------------- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| CSS Grid         | Flexbox              | Flexbox is one-dimensional (row or column), less ideal for page-level two-column layouts spanning multiple rows |
| Tailwind spacing | Custom CSS variables | Tailwind's scale is comprehensive and proportional (16 is 2x of 8), custom values reduce consistency            |
| Fluid layout     | Max-width container  | Max-width containers (1280px, 1536px) prevent use of space on ultrawide monitors, locked decision is fluid      |

**Installation:**

```bash
# Already installed in Celery
# Tailwind CSS 4 configured via @tailwindcss/vite in vite.config.ts
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── Calculator.tsx       # Main two-column layout
│   ├── ui/                  # shadcn components (Card, Input, etc.)
│   └── AnimatedNumber.tsx   # Reusable primitives
├── lib/
│   └── calculate.ts         # Business logic (separate from layout)
└── index.css                # Tailwind config, spacing scale, theme variables
```

### Pattern 1: Two-Column Grid with Sticky Results

**What:** Desktop layouts for input/results applications use CSS Grid with inputs on left, results on right, results panel sticky-positioned

**When to use:** Dashboards, calculators, configuration UIs where user enters data and sees live results

**Example:**

```tsx
// Source: Current Celery implementation (Calculator.tsx line 278) + research enhancements
<div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 lg:gap-8">
  {/* Left Column - Inputs */}
  <div className="space-y-6">{/* Rate input, settings panels */}</div>

  {/* Right Column - Results (sticky) */}
  <div className="lg:sticky lg:top-4 lg:self-start">
    <Card>{/* Results */}</Card>
  </div>
</div>
```

**Key elements:**

- `grid-cols-1`: Mobile stacks vertically (locked decision: ~768px breakpoint)
- `lg:grid-cols-[1fr,400px]`: Desktop uses flexible left column, fixed-width right (or `[2fr,1fr]` for proportional)
- `gap-6 lg:gap-8`: Generous spacing between columns (24px mobile, 32px desktop)
- `lg:sticky lg:top-4`: Results stay visible during scroll
- `lg:self-start`: Prevents sticky element from stretching full grid row height

**Column proportion options:**

- `[1fr,380px]`: Current Celery implementation (380px results panel)
- `[1fr,400px]`: Slightly wider results, common for dashboards
- `[2fr,1fr]`: Proportional 66/33 split, scales better on ultrawide
- `[3fr,2fr]`: 60/40 split, more balanced

### Pattern 2: Generous Whitespace System

**What:** Consistent spacing using Tailwind's 4px-based scale, prioritizing vertical rhythm and breathing room

**When to use:** All professional UIs, especially financial/data-heavy applications where clarity is critical

**Example:**

```tsx
// Source: Tailwind documentation + financial UI best practices
<div className="space-y-6">
  {" "}
  {/* 24px between major sections */}
  <Card className="p-6">
    {" "}
    {/* 24px card padding (shadcn default) */}
    <div className="space-y-4">
      {" "}
      {/* 16px between related groups */}
      <div className="space-y-2">
        {" "}
        {/* 8px between label and input */}
        <Label>Rate</Label>
        <Input />
      </div>
    </div>
  </Card>
</div>
```

**Spacing hierarchy:**

- `space-y-8` (32px): Between major unrelated sections
- `space-y-6` (24px): Between related sections (standard)
- `space-y-4` (16px): Between items in a group
- `space-y-3` (12px): Between tightly related items
- `space-y-2` (8px): Label-to-input spacing
- `space-y-1.5` (6px): Sub-labels or helper text

**Visual grouping via proximity:**
Whitespace creates hierarchy without borders or backgrounds. Items close together are perceived as related; large gaps signal separation.

### Pattern 3: Typography Scale for Visual Hierarchy

**What:** Use font size, weight, and spacing (not color/decoration) to create hierarchy

**When to use:** Results displays, financial dashboards, any UI where numbers are primary

**Example:**

```tsx
// Source: Current Celery results card (line 1063+)
{
  /* Hero value - large, bold */
}
<p className="text-3xl sm:text-4xl font-bold tracking-tight">
  <AnimatedNumber value={netAnnual} />
</p>;

{
  /* Secondary value - smaller */
}
<p className="text-xl sm:text-2xl font-bold tracking-tight">
  {formatCurrency(grossAnnual)}
</p>;

{
  /* Supporting details - muted */
}
<span className="text-xs sm:text-sm text-muted-foreground">Monthly</span>;
```

**Typography hierarchy:**

- Hero numbers: `text-3xl` to `text-4xl` (30-36px), `font-bold`, `tracking-tight`
- Secondary numbers: `text-xl` to `text-2xl` (20-24px), `font-bold`
- Labels: `text-xs` to `text-sm` (12-14px), `text-muted-foreground`
- Body: `text-sm` to `text-base` (14-16px)

### Pattern 4: Responsive Grid Breakpoint Strategy

**What:** Mobile-first approach with single breakpoint at 768px for desktop layout

**When to use:** Most responsive layouts, especially when locked decision specifies ~768px

**Example:**

```tsx
// Source: Bootstrap/Tailwind conventions + locked CONTEXT decision
// Mobile (< 768px): Stacked, results-first order
// Desktop (>= 768px): Side-by-side

<div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 lg:gap-8">
  {/* Mobile: order-1 shows first, Desktop: lg:order-2 reorders */}
  <div className="order-2 lg:order-1">Inputs</div>
  <div className="order-1 lg:order-2">Results</div>
</div>
```

**Tailwind breakpoints:**

- `sm:` 640px (large phones, small tablets portrait)
- `md:` 768px (tablets, small laptops)
- `lg:` 1024px (laptops, desktops) ← **Use this for desktop layout**
- `xl:` 1280px (large desktops)
- `2xl:` 1536px (ultra-wide)

**Locked decision uses ~768px**, so `lg:` prefix aligns with requirement.

### Anti-Patterns to Avoid

**1. Max-width containers on fluid layouts**

- **Bad:** `<div className="max-w-7xl mx-auto">`
- **Why:** Locked decision specifies "fluid columns that grow with screen width (no fixed max-width container)"
- **Correct:** Let grid columns expand naturally, use column proportions to control width

**2. Outer margins on components**

- **Bad:** Calculator component has `className="mt-4"` applied by parent
- **Why:** Components should manage internal spacing only, parent layouts handle external spacing
- **Correct:** Use `space-y-*` or `gap-*` on parent container

**3. Inconsistent spacing scales**

- **Bad:** Mixing `space-y-5`, `space-y-7`, arbitrary `mt-[18px]`
- **Why:** Breaks visual rhythm, looks unprofessional
- **Correct:** Stick to Tailwind's default scale (4, 6, 8, 12, 16, 24, 32, etc.)

**4. Fixed pixel widths on columns**

- **Bad (for fluid layouts):** `grid-cols-[500px,600px]`
- **Why:** Doesn't adapt to viewport width
- **Correct:** Use `fr` units or one fixed column + one flexible: `[1fr,400px]`

**5. Too many breakpoints**

- **Bad:** Different layouts at `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Why:** Maintenance burden, visual inconsistency
- **Correct:** Single breakpoint mobile → desktop (locked decision: ~768px)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                | Don't Build                         | Use Instead                                               | Why                                                                       |
| ---------------------- | ----------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Responsive grid system | Custom media queries and grid CSS   | Tailwind Grid utilities (`grid-cols-*`, `lg:grid-cols-*`) | Handles breakpoints, gap spacing, browser prefixes, tested across devices |
| Spacing consistency    | Arbitrary values like `mt-[17px]`   | Tailwind spacing scale (`space-y-4`, `gap-6`, `p-6`)      | Ensures visual rhythm, 8px grid alignment, easier to maintain             |
| Sticky positioning     | JavaScript scroll listeners         | CSS `sticky` + Tailwind (`lg:sticky lg:top-4`)            | Better performance, no layout shift, native browser optimization          |
| Component spacing      | Margins on component root elements  | Layout primitives (`space-y-*`, `gap-*` on parent)        | Prevents margin collapse, component stays reusable                        |
| Responsive typography  | Manual media queries for font sizes | Tailwind responsive prefixes (`text-xl lg:text-2xl`)      | Mobile-first scaling, consistent across components                        |

**Key insight:** Tailwind CSS 4's built-in utilities handle 90% of layout polish. Custom CSS should only be needed for truly unique design requirements not covered by the framework.

## Common Pitfalls

### Pitfall 1: Insufficient Whitespace on Desktop

**What goes wrong:** Layout feels cramped on wide screens despite having horizontal space

**Why it happens:** Using same spacing values (`gap-4`) across all screen sizes, not increasing whitespace proportionally with viewport width

**How to avoid:**

- Use responsive spacing: `gap-4 lg:gap-6 xl:gap-8`
- Increase card padding on desktop: `p-4 lg:p-6`
- Vertical spacing should grow: `space-y-3 lg:space-y-4`

**Warning signs:**

- Components feel "squished" on 1440px+ monitors
- Horizontal space available but not utilized
- Everything bunched to left despite fluid layout

### Pitfall 2: Fixed-Width Results Panel Too Narrow

**What goes wrong:** Results column (e.g., 300px fixed) looks cramped with long currency values or multi-column displays

**Why it happens:** Choosing fixed width without testing with real data (long numbers, currency symbols, converted values)

**How to avoid:**

- Test with maximum-length content (999,999,999 CAD → USD conversions)
- Use 380-400px minimum for financial calculators with dual-currency display
- Consider proportional instead of fixed: `[2fr,1fr]` scales better

**Warning signs:**

- Number truncation or wrapping
- Currency conversion display stacked instead of side-by-side
- Padding looks insufficient around large numbers

### Pitfall 3: Sticky Element Stretching Full Height

**What goes wrong:** Sticky results panel stretches to match left column height instead of staying compact

**Why it happens:** CSS Grid default alignment is `stretch`, sticky elements inherit full grid row height

**How to avoid:** Add `lg:self-start` to sticky element

**Example:**

```tsx
// Bad: Stretches full height
<div className="lg:sticky lg:top-4">

// Good: Stays compact
<div className="lg:sticky lg:top-4 lg:self-start">
```

**Warning signs:**

- Results card has excessive white space at bottom
- Background extends past content on tall pages

### Pitfall 4: Inconsistent Visual Hierarchy

**What goes wrong:** User can't quickly identify primary vs. secondary information, everything looks equally important

**Why it happens:** Not using typography scale intentionally, similar font sizes for different levels of importance

**How to avoid:**

- Hero numbers: `text-3xl+`, bold
- Secondary numbers: `text-xl`, bold
- Labels: `text-sm`, muted foreground color
- Use `tracking-tight` on large numbers for professional appearance
- Limit to 2-3 font sizes per component

**Warning signs:**

- User asks "what number should I look at?"
- All text feels same weight/prominence
- Overuse of color to create hierarchy (instead of size/weight)

### Pitfall 5: Breakpoint Thrashing

**What goes wrong:** Layout breaks or looks awkward at certain widths (e.g., 800px, 1100px)

**Why it happens:** Testing only at common sizes (375px, 768px, 1440px), not resizing browser fluidly

**How to avoid:**

- Test by resizing browser continuously from 320px to 1920px
- Use browser DevTools responsive mode with drag-to-resize
- Check edge cases: 767px (just before breakpoint), 769px (just after)

**Warning signs:**

- Horizontal scroll appears at specific widths
- Text wrapping creates awkward gaps
- Components overlap near breakpoint

### Pitfall 6: Over-Engineering Spacing System

**What goes wrong:** Creating custom spacing values (e.g., 18px, 22px, 34px) that break visual rhythm

**Why it happens:** Designer provides pixel-perfect mockup with arbitrary spacing, developer implements literally

**How to avoid:**

- Round custom values to nearest Tailwind spacing unit (8px increments)
- Extend spacing scale sparingly in `tailwind.config.js` only if needed repeatedly
- Prefer Tailwind's defaults: they're based on research and tested

**Warning signs:**

- Using arbitrary values frequently: `mt-[17px]`, `gap-[22px]`
- Spacing feels "off" but can't identify why (inconsistent rhythm)
- Hard to maintain (can't remember custom values)

## Code Examples

Verified patterns from current implementation and official sources:

### Two-Column Grid with Sticky Results

```tsx
// Source: Calculator.tsx line 278 (current) + enhancements from research
// BEFORE (current):
<div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] lg:grid-rows-[auto,1fr] gap-4 lg:gap-6">

// AFTER (recommended polish):
<div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 lg:gap-8">
  {/* Left column: Inputs + Settings */}
  <div className="space-y-6 lg:space-y-8">
    {/* Rate input section */}
    <div className="space-y-3">
      {/* Employment type, rate input */}
    </div>

    {/* Settings sections */}
    <div className="space-y-3">
      {/* Collapsible panels */}
    </div>
  </div>

  {/* Right column: Results (sticky on desktop) */}
  <div className="lg:sticky lg:top-4 lg:self-start">
    <Card className="shadow-xl">
      {/* Results display */}
    </Card>
  </div>
</div>
```

**Changes explained:**

- Removed `lg:grid-rows-[auto,1fr]` - unnecessary with sticky positioning
- Increased gap: `gap-4 lg:gap-6` → `gap-6 lg:gap-8` (24px → 32px on desktop)
- Results column: 380px → 400px (more breathing room for dual-currency)
- Added `lg:space-y-8` on left column for consistent vertical rhythm

### Responsive Card Padding

```tsx
// Source: shadcn/ui Card defaults + responsive enhancement
// Default shadcn Card uses p-6 (24px) always

// Option 1: Keep consistent (recommended for this calculator)
<Card className="p-4 lg:p-6">
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</Card>

// Option 2: Increase on desktop (if content feels cramped)
<Card className="p-4 lg:p-6 xl:p-8">
  {/* More generous padding on ultra-wide */}
</Card>
```

**When to use:**

- Option 1: Standard approach, shadcn default is already generous
- Option 2: If content is dense or many nested elements

### Generous Vertical Spacing

```tsx
// Source: Tailwind spacing best practices
<div className="space-y-6 lg:space-y-8">
  {/* Major sections: 24px mobile, 32px desktop */}

  <section className="space-y-4">
    {/* Related items: 16px */}

    <div className="space-y-2">
      {/* Tightly coupled: 8px */}
      <Label>Hourly Rate</Label>
      <Input />
    </div>
  </section>
</div>
```

**Hierarchy:**

- `space-y-8`: Between unrelated major sections (32px)
- `space-y-6`: Between related sections (24px) ← **Most common**
- `space-y-4`: Between items in a group (16px)
- `space-y-2`: Label-to-input (8px)

### Typography Scale for Numbers

```tsx
// Source: Calculator.tsx line 1063+ (current results display)
{
  /* Primary result: Take-home pay */
}
<div className="space-y-1">
  <p className="text-xs text-muted-foreground uppercase tracking-wide">
    Take-home
  </p>
  <p className="text-3xl sm:text-4xl font-bold tracking-tight leading-none tabular-nums">
    <AnimatedNumber value={calculation.netAnnual} />
  </p>
</div>;

{
  /* Secondary result: Gross */
}
<div className="space-y-1">
  <p className="text-xs text-muted-foreground uppercase tracking-wide">Gross</p>
  <p className="text-xl sm:text-2xl font-bold tracking-tight leading-none tabular-nums">
    {formatCurrency(calculation.grossAnnual)}
  </p>
</div>;

{
  /* Breakdown items */
}
<div className="flex justify-between items-baseline">
  <span className="text-xs sm:text-sm text-muted-foreground">Monthly</span>
  <span className="text-sm font-medium tabular-nums">$5,833</span>
</div>;
```

**Key classes:**

- `tabular-nums`: Monospaced digits, prevents layout shift when numbers change
- `tracking-tight`: Tighter letter spacing on large numbers (professional look)
- `leading-none`: Removes line-height excess on standalone numbers
- `uppercase tracking-wide`: Labels feel distinct from values

## State of the Art

| Old Approach                             | Current Approach                      | When Changed       | Impact                                          |
| ---------------------------------------- | ------------------------------------- | ------------------ | ----------------------------------------------- |
| Fixed breakpoints (480px, 768px, 1024px) | Content-first breakpoints             | 2020+              | Less rigid, adapts to actual content needs      |
| Max-width containers (1200px, 1440px)    | Fluid layouts with proportional grids | 2023+              | Better use of ultrawide monitors                |
| Flexbox for page layouts                 | CSS Grid for two-dimensional layouts  | 2021+              | Simpler code, better browser support now        |
| Pixel-perfect spacing                    | 8px grid systems (Tailwind default)   | 2019+              | Consistent visual rhythm, easier maintenance    |
| PostCSS for Tailwind                     | @tailwindcss/vite plugin              | 2024 (Tailwind v4) | Faster builds, native CSS features              |
| Viewport units for type (vw)             | `clamp()` for scalable typography     | 2023+              | Better accessibility, respects user zoom        |
| JavaScript for sticky headers            | CSS `position: sticky`                | 2019+              | Better performance, native browser optimization |

**Deprecated/outdated:**

- **Bootstrap Grid**: Still used but Tailwind has replaced it in modern React apps (utility-first approach preferred)
- **CSS-in-JS for layout**: Styled-components/Emotion for layout spacing (Tailwind utilities faster, better DX)
- **Container queries without support**: Can now use `@container` in production (2024 browser support 90%+)
- **Fixed-width sidebars only**: Proportional columns (`fr` units) now preferred for responsiveness

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal column proportions for this calculator**
   - What we know: Common ratios are 50/50, 60/40, or fixed 400px results column
   - What's unclear: Without user testing on 1440px+ monitors, can't confirm which feels most spacious
   - Recommendation: Start with `lg:grid-cols-[1fr,400px]` (current 380px → 400px), A/B test with `[2fr,1fr]` if design feels unbalanced

2. **Spacing between collapsible sections in settings panel**
   - What we know: Settings use Collapsible components with borders, current spacing is minimal
   - What's unclear: Should borders have spacing between them (`divide-y`) or stack directly (current)?
   - Recommendation: Test with `divide-y divide-border/50` for subtle separation vs. current borderless stacking

3. **Typography scale on ultra-wide (2560px+)**
   - What we know: Hero numbers use `text-3xl sm:text-4xl` (max 36px)
   - What's unclear: Should numbers scale further on 2xl: breakpoint? Financial apps often cap at 40-48px.
   - Recommendation: LOW priority (most users on <1920px), keep current sizing unless feedback requests larger

## Sources

### Primary (HIGH confidence)

- [Tailwind CSS Grid Layout Documentation](https://tailwindcss.com/docs/grid-template-columns) - Official Tailwind v4 grid utilities, fr units, responsive prefixes
- [Tailwind CSS Spacing Documentation](https://tailwindcss.com/docs/padding) - Default spacing scale (4px base unit), 8px grid system
- [CSS Grid Layout Guide - CSS-Tricks](https://css-tricks.com/css-grid-layout-guide/) - Authoritative guide to CSS Grid, fr units, alignment
- [shadcn/ui Card Component](https://ui.shadcn.com/docs/components/card) - Official documentation, default padding (p-6 = 24px)
- [MDN: Realizing common layouts using grids](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Common_grid_layouts) - Official MDN documentation on grid layout patterns

### Secondary (MEDIUM confidence)

- [9 Dashboard Design Principles (2026) - DesignRush](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles) - Dashboard layout best practices verified with official design sources
- [Fintech design guide with patterns that build trust [2026]](https://www.eleken.co/blog-posts/modern-fintech-design-guide) - Financial UI visual hierarchy, whitespace usage
- [Visual Hierarchy: Key UX Principles That Drive Results - Sessions College](https://www.sessions.edu/notes-on-design/visual-hierarchy-key-ux-principles-that-drive-results/) - Typography, spacing, proximity principles
- [12 Design Recommendations for Calculator and Quiz Tools - NN/g](https://www.nngroup.com/articles/recommendations-calculator/) - Nielsen Norman Group research on calculator UI patterns
- [Sticky sidebar CSS grid Tailwind layout patterns - GitHub Gist](https://gist.github.com/BjornDCode/5cb836a6b23638d6d02f5cb6ed59a04a) - Verified pattern for sticky sidebars with CSS Grid

### Tertiary (LOW confidence)

- [Responsive Design Best Practices: The Complete 2026 Guide - PxlPeak](https://pxlpeak.com/blog/web-design/responsive-design-best-practices) - General responsive design guidance (not calculator-specific)
- [Building a Responsive Grid Layout with Tailwind CSS - DEV Community](https://dev.to/ridoy_hasan/building-a-responsive-grid-layout-with-tailwind-css-3ocb) - Community tutorial, verify with official docs

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Tailwind CSS 4 and CSS Grid are established standards, verified with official documentation
- Architecture: HIGH - Two-column grid pattern verified across MDN, Tailwind docs, and current Celery implementation
- Pitfalls: MEDIUM - Based on community resources and general best practices, not calculator-specific research

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - Tailwind and layout patterns are stable, not fast-moving)

**Technology versions researched:**

- Tailwind CSS: 4.1.18 (current in Celery package.json)
- @tailwindcss/vite: 4.1.18
- React: 19.2.0
- shadcn/ui: Latest (component library, no fixed version)
- CSS Grid: Native browser feature (2026 support 98%+)
