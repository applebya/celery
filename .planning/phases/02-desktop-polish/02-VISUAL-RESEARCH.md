# Phase 2: Desktop Polish - Visual Redesign Research

**Researched:** 2026-02-22
**Domain:** Typography, color systems, CSS textures, Framer Motion animations, UI component patterns
**Confidence:** HIGH (font loading, Framer Motion, segmented control) / MEDIUM (specific oklch values, texture performance)

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Two-column layout on desktop: inputs left, results right
- Fluid columns that grow with screen width (no fixed max-width container)
- Breakpoint at ~768px: below is stacked (mobile), above is side-by-side (desktop)
- Natural left-to-right flow: enter data, then see results

### Claude's Discretion

- Exact column proportions (50/50, 40/60, etc.)
- Spacing between and within columns
- Whether columns have visual boundaries (cards, dividers, etc.)
- How results section is structured internally
- Whitespace and padding amounts
- Visual hierarchy within each column

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope
  </user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID      | Description                                                       | Research Support                                                |
| ------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| DESK-01 | Spacious layout with generous whitespace and breathing room       | Typography scale, spacing system, bg texture for depth          |
| DESK-02 | Calculator takes up more horizontal space on wide screens         | Already covered in 02-RESEARCH.md (fluid grid)                  |
| DESK-03 | Professional, refined visual hierarchy                            | Font selection (Fraunces display + Satoshi body), oklch palette |
| DESK-04 | Results displayed prominently with clear information architecture | AnimatedNumber pulse, color hierarchy, section accent bars      |
| VIS-01  | Refined typography (font sizes, weights, line heights)            | Fraunces variable font axes, Satoshi/General Sans body pairing  |
| VIS-02  | Consistent spacing system throughout the app                      | 8px-grid Tailwind scale (covered), oklch tokens                 |
| VIS-03  | Modern aesthetic that feels current (not dated)                   | Oklch color system, grainy gradient texture, variable fonts     |
| VIS-04  | Consistent component styling across all UI elements               | Segmented control pattern, accent bar pattern, color tokens     |
| VIS-05  | Polished transitions and micro-interactions                       | Framer Motion stagger entry, hover lift, scale pulse            |

</phase_requirements>

---

## Summary

The visual redesign centers on three pillars: **distinctive typography**, **warm oklch color palette**, and **purposeful motion**. The project already has a strong foundation — oklch colors in index.css, framer-motion for AnimatedNumber, and a `.bg-texture` SVG noise class — so this is refinement, not rewrite.

**Font strategy:** Replace DM Sans (body) with Satoshi (via Fontshare CDN or self-hosted woff2) and add Fraunces (via `@fontsource-variable/fraunces`) as a display serif for hero numbers and key labels. Fraunces with `SOFT 30, WONK 0` gives a distinctive but readable old-style character. JetBrains Mono stays for number display.

**Color strategy:** The current palette uses cool blue-grey foreground (`hue 260`) and green primary (`hue 160`). Shifting to a warmer moss-green primary (`hue ~145-150`), cream background (`hue ~85-95`), and adding a muted rust/terracotta for negative values makes the Financial Clarity aesthetic more distinctive. All values stay in oklch for perceptual uniformity.

**Motion strategy:** Framer Motion (already installed, v12) supports everything needed. Use variants with `staggerChildren` for page-load orchestration, `whileHover={{ y: -1 }}` for lift, and keyframe arrays for value-change pulse. The existing `AnimatedNumber` spring pattern is already the right approach.

**Primary recommendation:** Load Fraunces variable via `@fontsource-variable/fraunces`, use Satoshi via Fontshare CSS import, update oklch tokens in index.css, add the segmented control using Framer Motion `layoutId` (no new dependency), and use CSS `border-l-2` + primary color for collapsible accent bars.

---

## Standard Stack

### Core (already installed — no new deps)

| Library        | Version | Purpose                                                            | Status            |
| -------------- | ------- | ------------------------------------------------------------------ | ----------------- |
| framer-motion  | 12.26.2 | Stagger animations, hover/tap gestures, segmented control layoutId | Already installed |
| Tailwind CSS 4 | 4.1.18  | Utility classes for oklch color tokens, spacing, bg patterns       | Already installed |

### Font Loading

| Approach            | Package                         | Purpose                                                          | When to Use                  |
| ------------------- | ------------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| Fontsource variable | `@fontsource-variable/fraunces` | Self-hosted, tree-shakeable, no network latency for Google Fonts | **Recommended for Fraunces** |
| Fontshare CDN       | `@import` URL or `<link>`       | Satoshi — not on Fontsource, available free from Fontshare       | **Required for Satoshi**     |
| Google Fonts        | `@import` URL                   | Alternative for Fraunces if self-hosting is undesirable          | Fallback only                |
| Keep existing       | —                               | JetBrains Mono (numbers) stays via current Google Fonts import   | No change needed             |

### Supporting

| Library              | Version | Purpose                                                       | When to Use                                            |
| -------------------- | ------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| @radix-ui/react-tabs | 1.1.13  | Already installed — can be adapted for segmented control base | If building accessible segmented control on Radix      |
| CSS radial-gradient  | Native  | Dot grid background patterns                                  | Zero-dependency alternative to `.bg-texture` SVG noise |

### Alternatives Considered

| Instead of                         | Could Use                     | Tradeoff                                                                                                  |
| ---------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| Fraunces (display serif)           | DM Serif Display              | Less distinctive, no variable axes; Fraunces has SOFT/WONK for character                                  |
| Satoshi (body)                     | General Sans                  | General Sans not on Fontsource, not a variable font, requires CDN; Satoshi is similar quality             |
| Satoshi (body)                     | Keep DM Sans                  | DM Sans is fine but less distinctive than Satoshi's geometric-humanist character                          |
| Framer Motion layoutId (segmented) | Radix Themes SegmentedControl | Radix Themes is a separate package (`@radix-ui/themes`) — heavier than building from Tabs + framer-motion |
| CSS bg-texture (SVG noise)         | External noise PNG            | SVG inline is faster (no network request), already in the codebase                                        |

**Installation (new packages only):**

```bash
bun add @fontsource-variable/fraunces
```

Satoshi is loaded via CSS `@import` — no npm install needed.

---

## Architecture Patterns

### Recommended File Changes

```
src/
├── index.css           # Font imports + oklch token updates + new utility classes
├── components/
│   ├── Calculator.tsx  # Add Fraunces to hero numbers, segmented control for employment type
│   ├── AnimatedNumber.tsx  # Add scale pulse keyframe on value change
│   └── ui/
│       └── SegmentedControl.tsx  # NEW: custom component using framer-motion layoutId
```

---

### Pattern 1: Fraunces Variable Font Loading

**What:** Self-host Fraunces via Fontsource, use CSS `font-variation-settings` for SOFT and WONK axes.

**When to use:** Hero numbers, section headers with display context (>24px). Never for body text or numbers below 18px (WONK auto-deactivates below 18px at the browser level).

**Axes reference:**

- `wght`: 100–900 (weight)
- `opsz`: 9–144 (optical size — set to match px size for best rendering)
- `SOFT`: 0–100 (0 = sharp/crisp, 100 = rounded terminals)
- `WONK`: 0–1 (0 = normalized, 1 = quirky/eccentric. Binary-style; deactivates below 18px opsz)

**CSS import:**

```css
/* In index.css — replaces or supplements Google Fonts @import */
/* Import full variable axes (wght + opsz + SOFT + WONK) */
import "@fontsource-variable/fraunces/full.css";
/* The font-family name becomes "Fraunces Variable" */
```

**JS import (in main.tsx or index.css):**

```typescript
// In src/main.tsx
import "@fontsource-variable/fraunces/full.css";
```

**CSS usage:**

```css
/* For display headers: relatively soft, normalized letterforms */
.font-display {
  font-family: "Fraunces Variable", "Georgia", serif;
  font-variation-settings:
    "SOFT" 30,
    "WONK" 0,
    "opsz" 48;
  font-weight: 600;
}

/* For hero numbers: heavier, slightly softer */
.font-display-number {
  font-family: "Fraunces Variable", "Georgia", serif;
  font-variation-settings:
    "SOFT" 20,
    "WONK" 0,
    "opsz" 36;
  font-weight: 700;
}
```

**Google Fonts URL alternative** (if self-hosting is skipped):

```
https://fonts.googleapis.com/css2?family=Fraunces:SOFT,WONK,opsz,wght@0,0,9..144,100..900&display=swap
```

**Source:** [Fontsource variable docs](https://fontsource.org/docs/getting-started/variable), [Fraunces Google Design article](https://design.google/library/a-new-take-on-old-style-typeface), [@fontsource-variable/fraunces npm](https://www.npmjs.com/package/@fontsource-variable/fraunces)

---

### Pattern 2: Satoshi Font Loading (Fontshare CDN)

**What:** Satoshi is a geometric-humanist sans-serif from Indian Type Foundry (ITF), free under ITF Free Font License. Available via Fontshare CDN. **Not on Fontsource** (a font request was filed in 2023 but not fulfilled as of 2026-02-22).

**License:** ITF Free Font License — free for personal and commercial use. [Verify at fontshare.com/fonts/satoshi]

**CSS import:**

```css
/* In index.css — add alongside existing Google Fonts @import */
@import url("https://api.fontshare.com/v2/css?f[]=satoshi@1,900,700,500,400&display=swap");
```

**CSS usage:**

```css
:root {
  font-family:
    "Satoshi",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;
}
```

**Fallback strategy if CDN unavailable:** DM Sans (currently loaded), then system-ui. Since Satoshi is CDN-only (no npm), include DM Sans as fallback in the font stack:

```css
font-family:
  "Satoshi",
  "DM Sans",
  -apple-system,
  system-ui,
  sans-serif;
```

**Source:** [Fontshare Satoshi page](https://www.fontshare.com/fonts/satoshi), [Freebiesbug General Sans overview](https://freebiesbug.com/free-fonts/general-sans/) (General Sans comparison)

---

### Pattern 3: OKLch Color Palette — "Financial Clarity"

**What:** Update the oklch CSS custom properties in `index.css` to shift from cool blue-grey (`hue 260`) to warm moss-green and cream.

**OKLch hue guide for this palette:**

- **Moss/forest green hue:** ~140–155 (140 = yellow-green, 155 = pure green)
- **Warm cream/parchment hue:** ~85–95 (warm yellow-white)
- **Muted rust/terracotta hue:** ~30–40 (orange-red, low chroma for subtlety)
- **Cool grey (current blue-grey):** hue 260 → warm grey: hue 80–90 with very low chroma

**Recommended light theme tokens:**

```css
:root {
  /* Background: warm cream (instead of near-white blue-grey) */
  --background: oklch(
    0.982 0.005 90
  ); /* warm off-white, barely perceptible warmth */
  --card: oklch(1 0 0); /* pure white cards for contrast */

  /* Foreground: warm dark (not cool blue-grey) */
  --foreground: oklch(0.22 0.015 100); /* warm near-black */
  --card-foreground: oklch(0.22 0.015 100);

  /* Primary: moss green */
  --primary: oklch(0.48 0.13 148); /* warm moss green, saturated */
  --primary-foreground: oklch(0.98 0 0);

  /* Muted / Secondary: warm grey */
  --muted: oklch(0.95 0.005 90); /* warm light grey, hue near cream */
  --muted-foreground: oklch(0.52 0.015 90); /* warm medium grey */

  /* Accent: light green tint */
  --accent: oklch(0.93 0.025 148); /* very light moss green */
  --accent-foreground: oklch(0.32 0.09 148);

  /* Borders: warm grey */
  --border: oklch(0.88 0.008 90);
  --input: oklch(0.91 0.008 90);

  /* Success: financial green (keep existing green tone) */
  --success: oklch(0.55 0.15 148);

  /* Negative values (taxes, deductions): muted terracotta */
  /* Currently uses --destructive: oklch(0.55 0.2 25) */
  /* Keep but consider adding --negative alias: */
  --negative: oklch(0.52 0.12 35); /* muted rust, less alarming than red */
}
```

**Recommended dark theme tokens:**

```css
.dark {
  /* Background: deep forest green (not blue-grey) */
  --background: oklch(0.16 0.025 155); /* dark forest green */
  --card: oklch(0.2 0.022 155); /* slightly lighter forest green for cards */

  /* Foreground: warm cream */
  --foreground: oklch(0.93 0.01 90); /* cream white */

  /* Primary: bright moss green (higher L for contrast on dark bg) */
  --primary: oklch(0.72 0.18 148); /* bright moss green — current value, keep */
  --primary-foreground: oklch(0.14 0.02 155); /* dark forest bg */

  /* Muted: dark forest green with more lightness */
  --muted: oklch(0.24 0.02 155);
  --muted-foreground: oklch(0.62 0.015 90); /* warm grey */

  /* Borders */
  --border: oklch(0.3 0.02 155);
  --input: oklch(0.28 0.02 155);
}
```

**Confidence on values:** MEDIUM. These are computed from the oklch specification using known hue angles and perceptual lightness. Values should be visually verified in browser. Use [oklch.fyi](https://oklch.fyi/) or [oklch.com](https://oklch.com/) to fine-tune after seeing the result.

**Key oklch principles for fine-tuning:**

- `L` (Lightness): 0 = black, 1 = white. Perceptually uniform.
- `C` (Chroma): 0 = grey, 0.4 = max saturation. Greens typically peak at 0.28–0.35.
- `H` (Hue): 0/360 = red, 90 = yellow, 145–155 = green, 260 = blue

**Source:** [OKLCH MDN docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch), [OKLCH in CSS - Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl), [oklch.fyi picker](https://oklch.fyi/)

---

### Pattern 4: CSS Background Textures

**What:** Two approaches available in the codebase — the existing `.bg-texture` SVG noise (fractalNoise filter), and new pure-CSS approaches. Choose based on use case.

**Existing `.bg-texture` class (SVG feTurbulence):**

```css
/* Already in index.css — subtle noise overlay */
.bg-texture {
  background-image: url("data:image/svg+xml,<svg>...<feTurbulence baseFrequency='0.9' numOctaves='3'/>...</svg>");
  background-size: 200px;
}
```

This is applied as a `background-image` only — it tiles the SVG as a pattern. Good for full-page subtle grain.

**Grainy gradient technique (Frontend Masters approach)** — for gradient sections with grain baked in:

```html
<!-- Inline SVG filter placed once in DOM, zero layout cost -->
<svg width="0" height="0" aria-hidden="true" style="position: fixed">
  <filter
    id="grain"
    color-interpolation-filters="sRGB"
    x="0"
    y="0"
    width="1"
    height="1"
  >
    <feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="4" />
    <feDisplacementMap in="SourceGraphic" scale="10" xChannelSelector="R" />
    <feBlend in2="SourceGraphic" />
  </filter>
</svg>
```

```css
/* Applied to gradient element */
.gradient-grain {
  background: linear-gradient(
    135deg,
    oklch(0.93 0.025 148),
    oklch(0.982 0.005 90)
  );
  filter: url(#grain);
  clip-path: inset(0); /* prevents grain from bleeding outside bounds */
}
```

**Performance:** Keep `numOctaves` ≤ 4. The inline SVG filter is GPU-accelerated. Avoid applying to elements that change layout frequently.

**Dot grid background** — lightweight alternative for subtle depth:

```css
/* Pure CSS, zero SVG, renders as background-image */
.bg-dot-grid {
  background-image: radial-gradient(oklch(0.88 0.008 90) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

```html
<!-- Tailwind arbitrary value approach -->
<div
  class="bg-[radial-gradient(oklch(0.88_0.008_90)_1px,transparent_1px)] bg-[size:20px_20px]"
></div>
```

**Recommendation for Celery:** Use the existing `.bg-texture` class on the `<body>` at very low opacity (overlay with `mix-blend-mode: overlay, opacity: 0.04`) for subtle page texture. Use the CSS dot grid as a Tailwind utility on the inputs column for visual depth without performance cost.

**Source:** [Grainy Gradients - Frontend Masters](https://frontendmasters.com/blog/grainy-gradients/), [Grid and dot backgrounds - ibelick](https://ibelick.com/blog/create-grid-and-dot-backgrounds-with-css-tailwind-css)

---

### Pattern 5: Framer Motion Stagger Entry Animations

**What:** Animate sections into view on initial page load using variants with `staggerChildren`. Already used in the project for AnimatePresence/mode transitions.

**How variants propagate:** When a parent `motion.div` has `variants` with `staggerChildren`, child `motion.*` elements that also have matching variant names will animate in sequence automatically. No manual delay calculation needed.

**Page-load stagger pattern:**

```tsx
// Source: motion.dev/docs/react-motion-component + stagger docs
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // 80ms between each child
      delayChildren: 0.1, // 100ms initial delay before first child
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Usage in Calculator.tsx (wraps the two-column grid):
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.div variants={itemVariants}>
    {" "}
    {/* Left column */}
    {/* inputs */}
  </motion.div>
  <motion.div variants={itemVariants}>
    {" "}
    {/* Right column */}
    {/* results */}
  </motion.div>
</motion.div>;
```

**Hover lift effect on cards/sections:**

```tsx
// Source: motion.dev/docs/react-hover-animation
<motion.div
  whileHover={{ y: -2, transition: { duration: 0.15 } }}
  whileTap={{ y: 0 }}
  style={{ cursor: "pointer" }}
>
  {/* collapsible trigger content */}
</motion.div>
```

**Important:** `AnimateSharedLayout` is deprecated since Framer Motion v5. The project's current usage of `layoutId` on the active tab indicator (App.tsx line 516) is already the correct modern pattern — no wrapper needed.

**Source:** [Motion.dev stagger docs](https://motion.dev/docs/react-animation), [Motion.dev transitions](https://www.framer.com/motion/transition/)

---

### Pattern 6: Scale Pulse on Value Change (AnimatedNumber enhancement)

**What:** When the animated number updates (value prop changes), trigger a brief scale pulse to draw attention to the change. Works alongside the existing `useSpring` animation.

**Pattern using keyframe array:**

```tsx
// Source: motion.dev/docs/react-animation (keyframes section)
// Adds scale pulse wrapper around existing AnimatedNumber

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

function PulsingNumber({ value, formatter, className }: AnimatedNumberProps) {
  const prevValue = useRef(value);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (prevValue.current !== value && prevValue.current !== 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 400);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <motion.span
      className={className}
      animate={isPulsing ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <AnimatedNumber value={value} formatter={formatter} />
    </motion.span>
  );
}
```

**Alternative — simpler approach with key prop:**

```tsx
// Force remount to trigger initial animation on value change
// Works when you want the number to "pop" each time it updates
<motion.span
  key={Math.round(value / 1000)} // Only pulse on significant changes
  initial={{ scale: 1 }}
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 0.3 }}
>
  <AnimatedNumber value={value} formatter={formatter} />
</motion.span>
```

**Recommendation:** Use the `key` prop approach for simplicity. Quantize the key (divide by 1000, round) so only meaningful value changes trigger the pulse.

---

### Pattern 7: Segmented Control with Sliding Pill

**What:** Replace the current employment type button group (plain `<button>` elements with conditional classes) with an iOS-style segmented control using Framer Motion `layoutId` for the sliding indicator.

**Current implementation (Calculator.tsx lines 314–346):** Uses `flex flex-wrap gap-2` with individual styled `<button>` elements. No animation.

**Modern replacement using `layoutId`:**

```tsx
// Source: buildui.com/recipes/animated-tabs + motion.dev layout animation docs
// AnimateSharedLayout is DEPRECATED since framer-motion v5 — do NOT use it
// Modern approach: layoutId alone, no wrapper needed

import { motion } from "framer-motion";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; tooltip?: string }[];
  value: T;
  onChange: (value: T) => void;
  name: string; // unique name for layoutId namespacing
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative flex-1 px-3 py-2 text-sm font-medium rounded-md
              transition-colors duration-100 z-10
              ${isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
            `}
          >
            {/* Sliding pill indicator — shares layoutId across all instances */}
            {isSelected && (
              <motion.div
                layoutId={`segmented-pill-${name}`}
                className="absolute inset-0 bg-card shadow-sm rounded-md"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

**Usage in Calculator.tsx:**

```tsx
<SegmentedControl
  name="employment-type"
  options={EMPLOYMENT_TYPES.map((t) => ({
    value: t.value,
    label: t.shortLabel,
    tooltip: t.tooltip,
  }))}
  value={state.employmentType}
  onChange={handleEmploymentTypeChange}
/>
```

**Key points:**

- `layoutId={`segmented-pill-${name}`}` — include the `name` prop to namespace the layoutId, preventing conflicts if multiple SegmentedControls exist on the page (App.tsx already uses `layoutId="activeTab"` for tabs).
- Spring transition `stiffness: 500, damping: 35` — fast enough to feel responsive, subtle bounce.
- `AnimateSharedLayout` is NOT needed (deprecated since v5, removed in v6+). Plain `layoutId` works.

**Source:** [buildui.com animated tabs](https://buildui.com/recipes/animated-tabs), [Motion.dev layout animations](https://motion.dev/docs/react-layout-animations), [Samuel Kraft segmented control](https://samuelkraft.com/blog/segmented-control-framer-motion)

---

### Pattern 8: CSS Accent Bars on Collapsible Sections

**What:** Replace full borders on collapsible sections with a left accent bar to signal interactivity and hierarchy, instead of boxing content.

**Current pattern (Calculator.tsx lines 479–480):**

```tsx
<div className="space-y-1 rounded-lg border bg-card overflow-hidden">
  <Collapsible ...>
    <CollapsibleTrigger className="... border-t">
```

The sections share a single rounded card with internal `border-t` dividers.

**New accent bar pattern:**

```tsx
// Replace border-based grouping with accent-bar-per-section
<div className="space-y-2">
  <Collapsible open={openSection === "schedule"} ...>
    <CollapsibleTrigger className="
      flex items-center justify-between w-full
      px-4 py-3 lg:px-5 lg:py-3.5
      rounded-lg bg-card
      border-l-2 border-primary/0          /* Invisible initially */
      hover:border-primary/40              /* Shows on hover */
      data-[state=open]:border-primary     /* Full color when open */
      transition-colors
    ">
      <span className="text-sm font-medium">Work schedule</span>
      <ChevronRight ... />
    </CollapsibleTrigger>
    <CollapsibleContent className="px-4 pb-4 lg:px-5 lg:pb-5 border-l-2 border-primary/20 ml-0">
      {/* Content */}
    </CollapsibleContent>
  </Collapsible>
</div>
```

**Simpler Tailwind approach:**

```tsx
// Left border as accent — always visible, color signals state
<CollapsibleTrigger className="
  flex items-center justify-between w-full px-4 py-3
  rounded-lg hover:bg-muted/40 transition-colors
  border-l-2 border-transparent
  data-[state=open]:border-l-2 data-[state=open]:border-primary
">
```

**Note on Radix `data-[state=open]`:** Radix Collapsible/CollapsibleTrigger adds `data-state="open"` or `data-state="closed"` to the trigger element. Tailwind can target this with `data-[state=open]:border-primary`. Verify this is available in Tailwind 4 (it is: arbitrary data attributes are supported).

**Source:** Current Calculator.tsx implementation analysis, [Tailwind CSS data attributes](https://tailwindcss.com/docs/hover-focus-and-other-states#data-attributes)

---

### Anti-Patterns to Avoid

**1. Fraunces for body text**

- **Bad:** `font-family: "Fraunces Variable"` on body or small labels
- **Why:** Display serifs are illegible below ~18px; WONK axis auto-deactivates below 18px opsz anyway
- **Correct:** Fraunces only on elements ≥24px (hero numbers, section display headers)

**2. AnimateSharedLayout wrapper**

- **Bad:** `import { AnimateSharedLayout } from "framer-motion"` — it no longer exists in v5+
- **Why:** Removed in Framer Motion 5+. The project uses v12.26.2.
- **Correct:** `layoutId` alone on `motion.*` elements

**3. High oklch chroma on both foreground and background**

- **Bad:** Both `--background` and `--foreground` with C > 0.05
- **Why:** Creates visual vibration; perceptual contrast suffers
- **Correct:** Background near-neutral (C ≤ 0.01), foreground warm-neutral (C ≤ 0.02), primary gets the chroma

**4. SVG feTurbulence with `numOctaves` > 4**

- **Bad:** `numOctaves='6'` for finer grain
- **Why:** Computational cost scales non-linearly; causes jank on scroll
- **Correct:** `numOctaves='3'` or `'4'` maximum; adjust `baseFrequency` instead

**5. `key` prop on AnimatedNumber for every render**

- **Bad:** `key={value}` on the pulse wrapper — triggers on every decimal change
- **Why:** Causes excessive animation; feels broken on fast typing
- **Correct:** Quantize: `key={Math.round(value / 500)}` — only pulses on ~$500 changes

---

## Don't Hand-Roll

| Problem                        | Don't Build                                              | Use Instead                                                          | Why                                                                       |
| ------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Sliding pill segmented control | Custom CSS `transform: translateX()` with JS measurement | Framer Motion `layoutId`                                             | Automatically handles size + position changes; works across DOM rerenders |
| Variable font axis control     | Custom font face declarations per weight                 | `@fontsource-variable/fraunces/full.css` + `font-variation-settings` | Fontsource handles subsetting, woff2, @font-face declaration              |
| Color harmony                  | Manual hex picking                                       | oklch with consistent Chroma/Lightness, vary only Hue                | OKLCH ensures perceptual uniformity — same L = same perceived brightness  |
| Page stagger orchestration     | `setTimeout` chains for sequential fades                 | Framer Motion `staggerChildren` on parent variants                   | Single source of truth; respects `prefers-reduced-motion` automatically   |
| Grainy gradient                | External noise PNG loaded as background                  | Inline SVG `<filter>` + CSS `filter: url(#grain)`                    | No network request; GPU-accelerated; already in the codebase              |

**Key insight:** Framer Motion's layout animation engine (`layoutId`) handles the hardest part of the segmented control — measuring and interpolating between elements at different DOM positions. Building this with raw CSS `transform` requires manual measurement with `getBoundingClientRect()` and ResizeObserver, which is significantly more complex.

---

## Common Pitfalls

### Pitfall 1: Fontshare CDN in PWA/Offline Mode

**What goes wrong:** Satoshi loaded via Fontshare `@import` is unavailable when the app is offline (service worker caches app shell but not external fonts).

**Why it happens:** The Vite PWA plugin (Workbox) does not automatically cache third-party CDN assets.

**How to avoid:** Add a robust system font fallback: `"Satoshi", "DM Sans", -apple-system, system-ui, sans-serif`. DM Sans is already loaded via Google Fonts and cached by the service worker. Offline users get DM Sans, online users get Satoshi.

**Alternative:** Download Satoshi's woff2 files from Fontshare and self-host in `/public/fonts/`, then use `@font-face` directly. More work but fully offline-capable.

**Warning signs:** Offline PWA mode shows visibly different typography from online mode.

---

### Pitfall 2: Fraunces opsz Axis Mismatch

**What goes wrong:** Font renders with suboptimal letter spacing and stroke weight for its display size.

**Why it happens:** Not setting `opsz` to match the actual rendered size. At large sizes without `opsz`, optical spacing is designed for small text (too tight, strokes too thin).

**How to avoid:** Set `font-variation-settings: "opsz" 48` for 48px display text; `"opsz" 32` for 32px, etc. Or use `font-optical-sizing: auto` (browser auto-detects, less precise but sufficient).

**Warning signs:** Large display headings look slightly cramped or have uneven stroke weights.

---

### Pitfall 3: oklch Dark Mode Forest Green Too Saturated

**What goes wrong:** Dark mode background (`oklch(0.16 0.025 155)`) appears too vivid on certain displays, especially OLED where greens are bright.

**Why it happens:** Chroma 0.025 is subtle in sRGB but on P3 displays or OLED panels it can look more saturated.

**How to avoid:** Start with C = 0.018 and increase if the effect feels too subtle. Test on at least two display types.

**Warning signs:** Dark mode background looks "neon green" instead of "forest-y".

---

### Pitfall 4: Segmented Control layoutId Conflict with Tab Indicator

**What goes wrong:** The existing `layoutId="activeTab"` in App.tsx (line 517) conflicts with the segmented control's layoutId, causing the active tab underline to animate to the segmented control pill position.

**Why it happens:** `layoutId` is global by default in Framer Motion. Two elements with the same layoutId animate between each other.

**How to avoid:** Use namespaced layoutIds. The pattern above uses `segmented-pill-${name}` which avoids the `"activeTab"` string used in App.tsx. Always pass a unique `name` prop.

**Warning signs:** Clicking a segmented option causes the tab navigation underline to jump.

---

### Pitfall 5: Stagger Animation on Every State Update

**What goes wrong:** If the stagger animation container is inside a component that re-renders on every keystroke (Calculator.tsx), the fade-in fires repeatedly while the user types.

**Why it happens:** `initial="hidden" animate="visible"` re-runs whenever the component re-renders with a new key.

**How to avoid:** Wrap the stagger container in a component that only mounts once (e.g., `App.tsx` level, not inside `Calculator.tsx`). Or use `useReducedMotion()` + run animation only on first mount with a `useEffect` ref guard.

```tsx
// Guard pattern: only animate on first mount
const hasAnimated = useRef(false);
const controls = useAnimationControls();

useEffect(() => {
  if (!hasAnimated.current) {
    hasAnimated.current = true;
    controls.start("visible");
  }
}, [controls]);

<motion.div variants={containerVariants} initial="hidden" animate={controls}>
```

---

## Code Examples

### Complete Font Loading Setup (index.css)

```css
/* Replace existing Google Fonts @import with this: */

/* Fraunces variable — self-hosted via Fontsource (added to main.tsx) */
/* Satoshi — loaded via Fontshare CDN */
@import url("https://api.fontshare.com/v2/css?f[]=satoshi@1,900,700,500,400&display=swap");

/* Keep JetBrains Mono from Google Fonts for numbers */
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap");

@import "tailwindcss";
@import "tw-animate-css";

:root {
  /* Body: Satoshi, falls back to DM Sans (cached by SW), then system */
  font-family:
    "Satoshi",
    "DM Sans",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;
  /* ... rest of tokens */
}

/* Display: Fraunces for hero numbers and key labels */
.font-display {
  font-family: "Fraunces Variable", "Georgia", serif;
  font-variation-settings:
    "SOFT" 25,
    "WONK" 0,
    "opsz" 36;
}
```

```typescript
// src/main.tsx — add Fraunces variable font import
import "@fontsource-variable/fraunces/full.css";
import "./index.css";
import App from "./App.tsx";
// ...
```

---

### Updated oklch Token Set (index.css partial)

```css
:root {
  /* Warm cream background (was: oklch(0.985 0.002 90) — barely changed) */
  --background: oklch(0.982 0.006 88); /* slightly warmer */
  --card: oklch(1 0 0);

  /* Warm near-black foreground (was: blue-grey hue 260) */
  --foreground: oklch(0.22 0.015 95);
  --card-foreground: oklch(0.22 0.015 95);

  /* Moss green primary (was: oklch(0.45 0.12 160) — slightly warmer hue) */
  --primary: oklch(0.47 0.13 148);
  --primary-foreground: oklch(0.98 0 0);

  /* Warm muted (was: blue-grey hue 260) */
  --muted: oklch(0.96 0.006 88);
  --muted-foreground: oklch(0.52 0.014 88);

  /* Accent: light moss tint */
  --accent: oklch(0.94 0.024 148);
  --accent-foreground: oklch(0.3 0.09 148);

  /* Borders: warm grey */
  --border: oklch(0.9 0.008 88);
  --input: oklch(0.92 0.008 88);

  /* Ring: moss green */
  --ring: oklch(0.47 0.13 148);

  /* Negative values (taxes, deductions) — muted terracotta */
  --negative: oklch(0.52 0.11 35);
  --negative-foreground: oklch(0.98 0 0);

  /* Financial green (net take-home) */
  --success: oklch(0.55 0.15 148);
  --success-foreground: oklch(0.98 0 0);
}

.dark {
  /* Deep forest green background */
  --background: oklch(0.16 0.02 150);
  --card: oklch(0.2 0.018 150);
  --foreground: oklch(0.93 0.01 88); /* warm cream text */
  --card-foreground: oklch(0.93 0.01 88);

  --primary: oklch(0.72 0.18 148); /* bright moss — keep current */
  --primary-foreground: oklch(0.14 0.02 150);

  --muted: oklch(0.25 0.018 150);
  --muted-foreground: oklch(0.62 0.012 88);

  --border: oklch(0.3 0.018 150);
  --input: oklch(0.28 0.018 150);
  --ring: oklch(0.72 0.18 148);

  --negative: oklch(0.62 0.15 35);
  --success: oklch(0.72 0.18 148);
}
```

---

### Segmented Control Component (full)

```tsx
// src/components/ui/SegmentedControl.tsx
import { motion } from "framer-motion";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex gap-0.5 p-0.5 bg-muted rounded-lg ${className ?? ""}`}
      role="group"
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`
              relative flex-1 px-3 py-1.5 text-sm font-medium rounded-md
              transition-colors duration-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${
                isSelected
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId={`segmented-pill-${name}`}
                className="absolute inset-0 bg-card shadow-sm rounded-[calc(0.5rem-2px)]"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                  mass: 0.5,
                }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

---

## State of the Art

| Old Approach                   | Current Approach                         | When Changed                        | Impact                                                     |
| ------------------------------ | ---------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| RGB/HSL colors                 | oklch() for design tokens                | 2023–2024                           | Perceptually uniform; easier to create harmonious palettes |
| AnimateSharedLayout            | layoutId alone (no wrapper)              | Framer Motion v5 (2021)             | Simpler API; global layout tree more performant            |
| @import Google Fonts blocking  | `font-display: swap` + Fontsource        | 2020+                               | Faster paint; eliminates render-blocking                   |
| Custom SCSS for variable fonts | `font-variation-settings` in CSS         | 2022+ (variable font support broad) | Fewer font files; continuous weight/style axis             |
| PNG noise textures             | Inline SVG feTurbulence filter           | 2021+                               | Zero network request; better performance                   |
| Fixed weight button groups     | Framer Motion layoutId segmented control | 2022+                               | Smooth animation without manual measurement                |

**Deprecated/outdated:**

- `AnimateSharedLayout`: Removed in Framer Motion 5+. Project uses v12.26.2 — this wrapper does not exist.
- `@import` Google Fonts without `&display=swap`: Causes render-blocking. Current code lacks this — worth fixing.
- `font-family: "Fraunces"` (static): Works but loses access to variable axes.

---

## Open Questions

1. **Satoshi offline availability in PWA mode**
   - What we know: Fontshare CDN fonts are not cached by Workbox without explicit configuration
   - What's unclear: Whether this matters in practice for celery.info users (likely mostly online)
   - Recommendation: Use DM Sans as explicit fallback. If offline UX matters, self-host Satoshi woff2 files in `/public/fonts/`.

2. **Forest green dark mode background reception**
   - What we know: `oklch(0.16 0.020 150)` is a very subtle forest green; may not read as noticeably different from neutral dark
   - What's unclear: Whether users will perceive it as green or just "dark" — depends on display calibration
   - Recommendation: Try C = 0.025 first; if it looks too green on sRGB displays, dial back to C = 0.012.

3. **Fraunces on hero numbers vs. JetBrains Mono**
   - What we know: Fraunces is a serif display face; JetBrains Mono is a monospace code font. Both are currently used (JBM for numbers).
   - What's unclear: Whether mixing a display serif for the number label + mono for the actual numeric digits creates harmony or conflict
   - Recommendation: Use Fraunces for labels ("Net take-home", "Gross") and keep JetBrains Mono for the actual numeric values (tabular-nums). Don't use Fraunces for the digits themselves — the lack of tabular figures is a problem for financial display.

4. **Segmented control for 3 employment types with long labels**
   - What we know: "Contractor (hourly)", "Contractor (retainer)", "Employee" — three options with moderate label length
   - What's unclear: Whether the pill slides correctly when options have different widths (flex-1 makes them equal width, which solves this)
   - Recommendation: Use `flex-1` on each option so pill widths are equal. The current shortLabel ("Contractor", "Retainer", "Employee") keeps them short.

---

## Sources

### Primary (HIGH confidence)

- [motion.dev React animation docs](https://motion.dev/docs/react-animation) — variants, stagger, whileHover, keyframes
- [motion.dev layout animations](https://motion.dev/docs/react-layout-animations) — layoutId, LayoutGroup
- [motion.dev hover animations](https://motion.dev/docs/react-hover-animation) — whileHover scale/y patterns
- [Fontsource variable font docs](https://fontsource.org/docs/getting-started/variable) — install pattern, axis imports
- [@fontsource-variable/fraunces npm](https://www.npmjs.com/package/@fontsource-variable/fraunces) — confirmed available
- [Fraunces - Google Design](https://design.google/library/a-new-take-on-old-style-typeface) — axis descriptions (SOFT, WONK, opsz, wght)
- [OKLCH MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch) — L/C/H specification
- [Grainy Gradients - Frontend Masters](https://frontendmasters.com/blog/grainy-gradients/) — SVG filter technique
- [Grid/dot backgrounds - ibelick](https://ibelick.com/blog/create-grid-and-dot-backgrounds-with-css-tailwind-css) — CSS dot pattern

### Secondary (MEDIUM confidence)

- [buildui.com animated tabs](https://buildui.com/recipes/animated-tabs) — layoutId segmented control verified with framer-motion docs
- [Samuel Kraft segmented control](https://samuelkraft.com/blog/segmented-control-framer-motion) — older source using deprecated AnimateSharedLayout, but pill pattern concept valid
- [Fontshare Satoshi](https://www.fontshare.com/fonts/satoshi) — license and availability (verified free, CDN available)
- [Beautiful Web Type - Fraunces](https://beautifulwebtype.com/fraunces/) — display-only usage guidance
- [OKLCH in CSS - Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) — color system rationale
- [Fraunces Motion upgrade guide](https://motion.dev/docs/react-upgrade-guide) — AnimateSharedLayout deprecation confirmed

### Tertiary (LOW confidence)

- Specific oklch color values provided above — computed from L/C/H specification but should be visually verified in browser before finalizing
- General Sans (not researched deeply) — excluded from recommendation due to non-variable, non-Fontsource availability

---

## Metadata

**Confidence breakdown:**

- Font loading (Fraunces via Fontsource): HIGH — package confirmed on npm, fontsource docs verified
- Font loading (Satoshi via Fontshare): MEDIUM — CDN confirmed available, license confirmed, but no npm package
- Framer Motion patterns: HIGH — verified against motion.dev official docs, matches project's v12.26.2
- Segmented control (layoutId): HIGH — confirmed AnimateSharedLayout deprecated, layoutId is modern pattern
- OKLch color values: MEDIUM — computed from spec, need visual browser verification; use as starting point not final values
- CSS textures: HIGH — existing codebase already has working SVG noise; dot grid is pure CSS verified pattern
- Accent bars: HIGH — simple CSS border-l + Tailwind data attributes, no library needed

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (30 days — font APIs stable, framer-motion minor versions may shift)

**Technology versions researched:**

- framer-motion: 12.26.2 (current in project)
- Tailwind CSS: 4.1.18 (current in project)
- @fontsource-variable/fraunces: Latest (to be installed)
- Fraunces axes: wght 100–900, opsz 9–144, SOFT 0–100, WONK 0–1
