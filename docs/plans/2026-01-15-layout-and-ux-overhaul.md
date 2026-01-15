# Layout and UX Overhaul - Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Celery into a two-panel desktop layout with improved readability, consolidated settings, and better comparison UX.

**Date:** 2026-01-15

---

## 1. Desktop Two-Panel Layout

**Structure (≥768px breakpoint):**
- Left panel (40-45%): All inputs and collapsible settings
- Right panel (55-60%): Live results, currency conversion
- Mobile: Stacks vertically (inputs → results)
- Results panel sticky on desktop while scrolling inputs

```
┌─────────────────────────────────────────────────────────┐
│  CELERY                                    [Compare] ☀️  │
├──────────────────────────┬──────────────────────────────┤
│  INPUTS                  │  RESULTS                     │
│  [$] Hourly Rate         │  Take-home    $85,240       │
│  [40] hrs/week           │  Gross        $104,000      │
│  [50] weeks/year         │  ─────────────────────────  │
│                          │  🇨🇦 Also in CAD             │
│  ▸ Work Schedule         │  Take-home    C$115,824     │
│  ▸ Tax Estimate          │                              │
│  ▸ Currency Settings     │  [Exchange rate footer]      │
├──────────────────────────┴──────────────────────────────┤
│  [Share]                              [Compare Jobs →]  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Work Schedule (Consolidated Section)

**Combines Location + Time Off into single collapsible:**

- Country selector with flag emoji
- Region/province selector
- 3-column grid: Holidays | PTO | Sick Days
- Paid time off toggle
- Summary line showing billable hours/year

**Collapsed state:** "🇺🇸 California · 22 days off"

```
▾ Work Schedule                      🇺🇸 California · 22 days off
  ┌─────────────────────────────────────────────────────┐
  │  Country          Region                            │
  │  [🇺🇸 USA ▾]       [California ▾]                    │
  │                                                     │
  │  ┌─────────────┬─────────────┬─────────────┐       │
  │  │ Holidays    │ PTO         │ Sick Days   │       │
  │  │ [11]        │ [15]        │ [5]         │       │
  │  │ public      │ vacation    │ personal    │       │
  │  └─────────────┴─────────────┴─────────────┘       │
  │                                                     │
  │  ☑ Employer provides paid time off                 │
  │                                                     │
  │  Summary: 2,024 billable hours/year                │
  └─────────────────────────────────────────────────────┘
```

---

## 3. Currency Settings (Toggle + Presets)

**Features:**
- Master toggle: "Show currency conversion" - hides entire conversion column when off
- Display currency selector with flag emoji
- Quick preset chips: Wise (0.5%) | Bank (2.5%) | PayPal (3.5%) | Custom
- Slider still adjustable after selecting preset
- "Custom" chip auto-selects when slider moved from preset value

**Collapsed state:** "🇨🇦 CAD · 2% margin" or "Disabled"

```
▾ Currency Settings                          🇨🇦 CAD · 2% margin
  ┌─────────────────────────────────────────────────────┐
  │  ☑ Show currency conversion                        │
  │                                                     │
  │  Display Currency                                   │
  │  [🇨🇦 CAD ▾]                                        │
  │                                                     │
  │  Conversion Margin               ⓘ                  │
  │  ┌──────┬──────┬──────┬────────┐                   │
  │  │ Wise │ Bank │PayPal│ Custom │                   │
  │  └──────┴──────┴──────┴────────┘                   │
  │  [━━━━━━━━●━━━━━━━━━━━━━━━━━━━━]  2.0%             │
  └─────────────────────────────────────────────────────┘
```

---

## 4. Comparison View (Horizontal Rows)

**Table-style layout for aligned comparison:**
- Each metric (Gross, Net, Hourly, Hours) is a row
- Values in consistent columns with tabular-nums
- Percentage difference on right
- Winner indicator on higher net value
- Plain-English verdict at bottom

```
┌─────────────────────────────────────────────────────────┐
│  Compare Job Offers                              [← Back]│
├─────────────────────────────────────────────────────────┤
│  [Current Job ✎]              [New Offer ✎]      [+ Add]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GROSS ANNUAL                                          │
│  $104,000                     $120,000         +15.4%  │
│                                                         │
│  NET ANNUAL (Take-home)                                │
│  $85,240  ●                   $94,800          +11.2%  │
│                                                         │
│  EFFECTIVE HOURLY                                      │
│  $50.00                       $52.88           +5.8%   │
│                                                         │
│  HOURS/YEAR                                            │
│  2,080                        2,264            +8.8%   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Verdict: New Offer pays $9,560 more annually (net)    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Font Sizes (16px Minimum)

| Element | Current | New |
|---------|---------|-----|
| Input labels | text-sm (14px) | text-base (16px) |
| Result labels | text-xs (10px) | text-base (16px) |
| Settings text | text-sm (14px) | text-base (16px) |
| Result values | text-2xl (24px) | text-3xl (30px) |
| Secondary values | text-sm (14px) | text-lg (18px) |
| Exchange footer | text-[11px] | text-base (16px) |
| Badges | text-[9px] | text-sm (14px) |

---

## 6. Currency Flags (Emoji)

**Flag mapping:**
- 🇺🇸 USD
- 🇨🇦 CAD
- 🇪🇺 EUR
- 🇬🇧 GBP

**Usage locations:**
- Currency selectors (primary and display)
- Result headers
- Collapsed section summaries
- Comparison view headers

---

## Implementation Order

1. **Phase 1: Layout Foundation**
   - Two-panel desktop layout with responsive breakpoints
   - Sticky results panel

2. **Phase 2: Work Schedule Consolidation**
   - Merge Location + Time Off sections
   - 3-column time-off grid
   - Updated collapsed summary

3. **Phase 3: Currency Settings Overhaul**
   - Add conversion toggle
   - Implement preset chips
   - Wire up toggle to hide/show conversion column

4. **Phase 4: Font Size Bump**
   - Systematic update of all font sizes to 16px minimum
   - Adjust spacing as needed

5. **Phase 5: Currency Flags**
   - Add emoji flags to currency selectors
   - Add flags to result headers and summaries

6. **Phase 6: Comparison View Redesign**
   - Horizontal row layout
   - Aligned columns with tabular-nums
   - Verdict line
