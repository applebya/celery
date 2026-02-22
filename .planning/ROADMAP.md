# Roadmap: Celery Polish Milestone

## Overview

This milestone transforms Celery from functional to delightful. We start by simplifying scope (removing corporation type), then systematically polish the desktop experience, mobile experience, visual refinement, and finally add professional branding. Each phase delivers observable improvements that make the calculator more pleasant to use and share.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Scope Simplification** - Remove corporation employment type
- [ ] **Phase 2: Desktop Polish + Visual Redesign** - Layout, typography, color, texture, motion
- [ ] **Phase 3: Mobile Polish** - Clean, touch-friendly mobile experience
- [ ] **Phase 4: Brand Assets** - Logo, favicon, icons, social images

## Phase Details

### Phase 1: Scope Simplification

**Goal**: Simplify employment type options to employee and self-employed only
**Depends on**: Nothing (first phase)
**Requirements**: SCOPE-01, SCOPE-02
**Plans:** 1 plan

**Success Criteria** (what must be TRUE):

1. Corporation employment type is removed from UI dropdown
2. All references to corporation type removed from labels and help text
3. Existing calculations work correctly for employee and self-employed types
4. No console errors or broken UI from removal

Plans:

- [x] 01-01-PLAN.md - Remove corporation types, calculation logic, tax data, and UI

### Phase 2: Desktop Polish + Visual Redesign

**Goal**: Desktop layout feels spacious, professional, and visually distinctive — "Financial Clarity" aesthetic
**Depends on**: Phase 1
**Requirements**: DESK-01, DESK-02, DESK-03, DESK-04, VIS-01, VIS-02, VIS-03, VIS-04, VIS-05
**Plans:** 3 plans

**Success Criteria** (what must be TRUE):

1. Layout uses generous whitespace on wide screens (no cramped feel)
2. Calculator takes advantage of horizontal space (multi-column where appropriate)
3. Visual hierarchy is clear — net take-home is the hero number, 2-3x larger than other figures
4. Results are prominently displayed with clear information architecture
5. Typography uses distinctive fonts (not Inter/DM Sans) — display serif for hero numbers, clean geometric sans for body
6. Color palette is warm and organic (moss green primary, cream backgrounds) not generic teal/gray
7. Background has depth and texture (gradient mesh, grain) not flat solid colors
8. Dark mode uses forest green tones, not generic slate
9. Micro-interactions and motion feel polished (entry animations, hover states, number transitions)
10. All components have consistent styling matching the new design language

Plans:

- [x] 02-01-PLAN.md — Desktop layout polish with two-column grid, spacing, and visual hierarchy
- [ ] 02-02-PLAN.md — Typography, color palette, and texture foundation ("Financial Clarity" design tokens)
- [ ] 02-03-PLAN.md — Component polish and motion (segmented control, accent bars, animations, pill tabs)

### Phase 3: Mobile Polish

**Goal**: Mobile experience is clean, uncluttered, and not frustrating
**Depends on**: Phase 2
**Requirements**: MOB-01, MOB-02, MOB-03, MOB-04
**Plans:** TBD

**Success Criteria** (what must be TRUE):

1. Mobile layout is clean and uncluttered (no overwhelming density)
2. All tap targets are appropriately sized (minimum 44x44px touch areas)
3. Scrolling is smooth without janky interactions or layout shifts
4. Key information (rate, results) visible without excessive scrolling
5. Mobile users can enter data and see results efficiently

Plans:

- [ ] TBD during planning

### Phase 4: Brand Assets

**Goal**: Celery has professional branding assets for all contexts
**Depends on**: Phase 3
**Requirements**: BRAND-01, BRAND-02, BRAND-03, BRAND-04
**Plans:** TBD

**Success Criteria** (what must be TRUE):

1. Logo exists with celery and money theme (literal style as requested)
2. Favicon appears in browser tabs in multiple sizes (16x16, 32x32, SVG)
3. PWA icons exist for installation (192x192, 512x512)
4. Open Graph image displays when link is shared on social media
5. All brand assets load correctly and appear professional

Plans:

- [ ] TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase                               | Plans Complete | Status      | Completed  |
| ----------------------------------- | -------------- | ----------- | ---------- |
| 1. Scope Simplification             | 1/1            | Complete    | 2026-02-01 |
| 2. Desktop Polish + Visual Redesign | 1/3            | In progress | -          |
| 3. Mobile Polish                    | 0/TBD          | Not started | -          |
| 4. Brand Assets                     | 0/TBD          | Not started | -          |
