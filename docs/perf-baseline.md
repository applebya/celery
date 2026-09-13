# Performance baseline — celery.info

Measured **2026-09-13**, before any Lighthouse-100 mission work.

## Method

Lighthouse 13.4.1, **mobile preset, default simulated throttling**, run against
the **deployed origin** `https://celery.info` (not localhost). Three runs; the
median run is reported. Commit under test: `cb101a9`.

> Run under Node 26. These runs hit a one-off `chrome-launcher` failure
> under bun (`Failed to fetch browser webSocket URL … HTTP Not Found`) and
> Node was used instead. **That was a transient fault, not a bun
> incompatibility** — retested later, the identical script succeeded under
> bun 1.3.5 three times out of three. It reads as a race between Chrome
> starting and its devtools endpoint accepting connections. Either runtime
> is fine; the numbers here are unaffected.

## Scores

| Category       | Score | Notes                                        |
| -------------- | ----- | -------------------------------------------- |
| Performance    | 87    | runs: 79 / 87 / 87 — see variance note        |
| Accessibility  | 98    | single audit failing                          |
| Best practices | 96    | two audits failing                            |
| SEO            | 100   | —                                             |

### Variance note

The mission brief records celery at **perf 77**. Three consecutive runs here
gave **79 / 87 / 87**. `appleby-web-services-ltd/tools/build-lighthouse.ts`
takes a **single unrepeated run** per site, so the published project-card
numbers are one sample each and swing by ~8 points on this page. The 77 is
consistent with having caught a cold/slow run.

Under the mission's own rule — a score with no method attached is worth
nothing — `build-lighthouse.ts` should take a median of N before the final
mission re-run, or the published figures will keep moving on their own.

## Core metrics (median run)

| Metric                   | Value  | Score |
| ------------------------ | ------ | ----- |
| First Contentful Paint   | 2.6 s  | 65    |
| Largest Contentful Paint | 3.5 s  | 64    |
| Total Blocking Time      | 80 ms  | 99    |
| Cumulative Layout Shift  | 0      | 100   |
| Speed Index              | 2.6 s  | 97    |
| Time to Interactive      | 3.5 s  | 92    |
| Server response time     | 10 ms  | 100   |

Paint is the whole problem. TBT, CLS and TTFB are already fine; every
available point is in FCP and LCP, which together carry 35 of the 100
performance weight.

## Payload (median run)

Total **364.9 KB** over **17 requests**.

| Bytes    | Type       | Resource                                        |
| -------- | ---------- | ----------------------------------------------- |
| 216.4 KB | script     | `/assets/index-BZkXeSm0.js`                     |
| 42.5 KB  | font       | `cdn.fontshare.com` (Satoshi)                   |
| 33.4 KB  | script     | `us-assets.i.posthog.com/static/surveys.js`     |
| 33.4 KB  | other      | `/pwa-192x192.png`                              |
| 12.0 KB  | stylesheet | `/assets/index-D9CuhmXw.css`                    |
| 8.7 KB   | script     | posthog `dead-clicks-autocapture.js`            |
| 6.8 KB   | image      | `/logo.png`                                     |
| 4.2 KB   | script     | posthog `web-vitals.js`                         |
| 1.2 KB   | stylesheet | `fonts.googleapis.com` (JetBrains Mono)         |
| 1.2 KB   | stylesheet | `api.fontshare.com` (Satoshi CSS)               |

Local `bun run build` additionally emits **two Fraunces cuts** —
`fraunces-latin-full` 121.0 KB and `fraunces-latin-ext-full` 105.2 KB — and a
service-worker precache of **19 entries / 1296 KiB**. `src/main.tsx` imports
`@fontsource-variable/fraunces/full.css`, which declares every axis and subset.

## Failing audits

### Performance

| Audit                        | Cost                | Detail                                                                 |
| ---------------------------- | ------------------- | ---------------------------------------------------------------------- |
| `render-blocking-insight`    | ~600 ms             | `fonts.googleapis.com` (772 ms) + `api.fontshare.com` (766 ms)          |
| `unused-javascript`          | ~141 KB / ~450 ms   | 114 KB of the 216 KB app bundle; 27 KB of posthog `surveys.js`          |
| `cache-insight`              | ~252 KB             | short cache lifetimes — GitHub Pages, headers not controllable          |
| `legacy-javascript-insight`  | ~28 KB              | posthog `web-vitals` + `surveys`, and 8 KB in the app bundle            |
| `image-delivery-insight`     | ~6 KB               | `logo.png` unoptimised                                                  |
| `unsized-images`             | CLS risk            | `logo.png` has no explicit `width`/`height`                             |
| `network-dependency-tree`    | —                   | font CSS sits on the critical chain                                     |

The two font stylesheets are reached by CSS `@import` from `src/index.css`, so
the browser must download **and parse** `index.css` before it even discovers
them. That is the single worst shape for a critical-path request and is where
most of the FCP/LCP loss lives.

### Accessibility (98)

| Audit                | Weight | Detail                               |
| -------------------- | ------ | ------------------------------------ |
| `landmark-one-main`   | 3      | document has no `<main>` landmark     |

One fix takes this category to 100.

### Best practices (96)

| Audit                   | Detail                                                        |
| ----------------------- | ------------------------------------------------------------- |
| `image-size-responsive` | `logo.png` served below its displayed resolution               |
| `valid-source-maps`     | no source maps for the 216 KB first-party bundle               |

## Harness note

`tools/measure-perf.ts` and `tools/audit-a11y.ts` are copied verbatim from
`appleby-web-services-ltd` so celery's numbers stay comparable with the other
sites in the mission. measure-perf uses Pixel 5 / Slow-4G / 4x CPU, median of
three; audit-a11y runs axe at two breakpoints plus a tab-order sweep.
