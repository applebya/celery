# Celery

## What This Is

A privacy-focused salary calculator that converts hourly rates to annual compensation with tax estimates for USA and Canada. Works offline as a PWA. This milestone focuses on visual polish and UX improvements to make it enjoyable to use on both desktop and mobile.

## Core Value

Quick, accurate salary conversion with tax estimates that's actually pleasant to use.

## Requirements

### Validated

- ✓ Hourly to annual salary conversion with configurable hours/week and weeks/year — existing
- ✓ Tax estimates for USA (federal + state) and Canada (federal + provincial) — existing
- ✓ Employee and self-employed employment types with appropriate tax handling — existing
- ✓ Multi-scenario support with save/load and comparison mode — existing
- ✓ URL sharing for calculator state — existing
- ✓ localStorage persistence across sessions — existing
- ✓ PWA with offline support via Workbox service worker — existing
- ✓ Dark/light theme toggle — existing
- ✓ Currency conversion with cached exchange rates — existing
- ✓ Monthly, bi-weekly, daily, hourly breakdown display — existing

### Active

- [ ] Remove corporation employment type (simplify to employee/self-employed only)
- [ ] Desktop layout overhaul — spacious, breathing room, professional feel
- [ ] Mobile layout overhaul — clean, easy to use, not frustrating
- [ ] Visual polish — refined typography, spacing, modern aesthetic
- [ ] Branding — logo and favicon with celery + money theme
- [ ] Consistent component styling across all UI elements

### Out of Scope

- New calculation features — this is a polish milestone
- Additional countries/regions — defer to future
- User accounts or cloud sync — keeping it simple and privacy-focused
- Corporation employment type — removed to simplify scope

## Context

Celery is live at celery.info and functional. The core calculation logic is solid. The current pain points are UX-related: the interface feels cramped on desktop, frustrating on mobile, and lacks visual refinement. This milestone is about making the existing functionality shine.

**Technical environment:**

- React 19 + TypeScript strict mode
- Vite 7 with Tailwind CSS 4
- shadcn/ui components (Radix primitives)
- PWA via vite-plugin-pwa

**Codebase state:**

- Well-structured with clear separation (components, hooks, lib, data)
- Good test coverage (Vitest + Playwright)
- No major technical debt blocking this work

## Constraints

- **Stack**: Keep existing React/Vite/Tailwind/shadcn stack — no framework changes
- **Hosting**: GitHub Pages (static only, no backend)
- **Privacy**: No user tracking beyond anonymous PostHog analytics
- **Offline**: Must maintain PWA offline capability

## Key Decisions

| Decision                  | Rationale                                | Outcome   |
| ------------------------- | ---------------------------------------- | --------- |
| Remove corporation type   | Simplify scope, focus on income taxes    | — Pending |
| Literal celery+money logo | User preference, can iterate later       | — Pending |
| Polish over features      | User wants to be proud to share the link | — Pending |

---

_Last updated: 2026-02-01 after initialization_
