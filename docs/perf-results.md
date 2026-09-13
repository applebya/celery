# Performance results — celery.info

Mission: Lighthouse 100. Worked 2026-09-13. Baseline in
[`perf-baseline.md`](./perf-baseline.md).

## Method

Lighthouse 13.4.1, **mobile preset, default simulated throttling**, run
against the **deployed origin** `https://celery.info`. Five runs, median
reported, spread given — a single Lighthouse run on this page moved by up to
12 points, so one sample is not a measurement.

Before: commit `cb101a9`. After: commit `ec10db3`.

Run under Node 26. `chrome-launcher` cannot hand Lighthouse a websocket
endpoint under bun 1.3.5, so `bun run lighthouse` in
`appleby-web-services-ltd` currently measures nothing — see "Open items".

## Scores

| Category       | Before | After   |
| -------------- | ------ | ------- |
| Performance    | 87     | **99**  |
| Accessibility  | 98     | **100** |
| Best practices | 96     | **100** |
| SEO            | 100    | **100** |

Before runs: 79 / 87 / 87. After runs: 98 / 99 / 99 / 99 / 97.

The spread collapsing matters as much as the median moving. Before, the score
swung between 79 and 98 depending on how the network behaved on the day,
because the critical path depended on two third-party font CDNs. It is now
network-independent enough to land within two points of itself every run.

## Metrics

| Metric                   | Before   | After    |         |
| ------------------------ | -------- | -------- | ------- |
| First Contentful Paint   | 2.56 s   | 1.52 s   | −41%    |
| Largest Contentful Paint | 3.50 s   | 1.82 s   | −48%    |
| Total Blocking Time      | 78 ms    | 43 ms    | −45%    |
| Speed Index              | 2.56 s   | 1.52 s   | −41%    |
| Cumulative Layout Shift  | 0        | 0        | —       |
| Transfer                 | 363.1 KB | 327.1 KB | −10%    |
| Requests                 | 17       | 16       | −1      |
| **Third-party bytes**    | 91.6 KB  | 5.6 KB   | **−94%** |
| Third-party requests     | 9        | 4        | −5      |
| Third-party origins      | 5        | 2        | −3      |

Entry chunk: 694 KB → 331 KB (gzip 219 → 107 KB).
Service-worker precache: 1296 KiB → 872 KiB.

## What did the work

In rough order of payoff.

1. **Self-hosted the fonts.** Satoshi and JetBrains Mono were reached by CSS
   `@import` from `src/index.css`, so the browser could not discover them
   until that stylesheet had downloaded *and parsed* — about 600 ms of
   render-blocking on the critical path. Fontshare was also serving a
   variable face spanning 300–900 *and* four static weights of the same
   family; the variable cut alone covers every weight the design uses.
   Satoshi is preloaded (the LCP element is text) and has a metric-matched
   fallback so the swap does not reflow. Three preconnects went with the CDNs.

2. **Took the animation library off the critical path.** The LCP element is
   the onboarding body copy, and it sat inside a `motion.div` animating from
   `opacity: 0` — the largest paint could not register until the fade
   finished. `App.tsx` no longer imports framer-motion; its six motion usages
   are CSS keyframes that honour `prefers-reduced-motion`. Calculator and
   CompareView are lazy, so framer-motion and motion-dom (~426 KB of source)
   live in their chunks rather than the entry, and are warmed during idle
   after first paint. This is what moved LCP from 3.5 s to 1.8 s.

3. **Deferred PostHog.** It was imported statically, so the analytics client
   had to download, parse and execute before anything could paint, and then
   pulled ~46 KB more at runtime — surveys.js and dead-clicks-autocapture.js,
   neither of which this site uses. Both are off; the client loads on
   `requestIdleCallback`. Events fired before it lands are queued, not dropped.

4. **A `<main>` landmark on the onboarding view.** The calculator view had
   one; the screen every first-time visitor actually sees did not. That alone
   was accessibility 98.

5. **A 2x WebP logo with intrinsic dimensions.** `logo.png` was 67×80 but
   displayed at 128 device pixels. `pwa-512x512.png` turned out to be the same
   artwork at 512×512, so the replacement is downscaled from real pixels
   rather than upscaled; same proportions, four times the resolution, 7.6 KB.

6. **Build config.** Source maps on (best-practices `valid-source-maps` finds
   them via the `sourceMappingURL` comment, so `hidden` would not have
   worked); `target: es2022` to stop shipping ~8 KB of helpers for syntax
   every supported browser has natively; inline SW registration, since
   `registerSW.js` was a render-blocking request that did nothing but call
   `serviceWorker.register`; and fonts out of the precache glob, which was
   pulling every unicode-range subset including latin-ext and vietnamese.

## Why not 100

Performance sits at 99, held there by FCP (1.5 s, scoring 95) rather than
anything on the page: the remaining audits with any weight are paint timings,
and TBT, CLS and Speed Index are already at 100.

The one structural item left is `cache-insight`, ~265 KiB of "use efficient
cache lifetimes". GitHub Pages does not expose cache-control headers, so this
cannot be fixed from inside the repo — it is a hosting question, not a payload
one, and it is the open `NA-lh-2` decision in the mission brief. Every other
lever here is payload, and payload is no longer the constraint.

## Guarding it

`bun run verify` — typecheck, unit tests, build, axe at two breakpoints, and
the perf harness at Pixel 5 / Slow-4G / 4x CPU. `tools/verify.ts` owns the
preview server so the gate cannot silently pass by not running.

`tools/measure-perf.ts` and `tools/audit-a11y.ts` are copied from
`appleby-web-services-ltd` so the numbers stay comparable across the mission
sites. One fix was needed: `audit-a11y.ts` now waits for fonts and animations
to settle before scanning. axe folds opacity into its contrast maths, so
scanning straight after `load` caught the onboarding fade-in at opacity 0.26
and reported ten serious contrast failures against text that was merely still
arriving. A fast local preview lost that race every time while the deployed
origin usually won it, so the same page passed or failed depending on where it
was served from. **That fix should travel with the harness to the other repos.**

## Costs accepted

- The onboarding screen no longer fades in. This was the direct LCP gate.
- The active tab underline no longer slides between tabs (`layoutId`).
- The "Saved" toast and the calculator/compare switch lose their exit
  animations; entrances are CSS and respect `prefers-reduced-motion`.
- Returning visitors can briefly see a Suspense fallback if the idle warm-up
  has not landed before they interact.

## Open items

- `bun run lighthouse` in `appleby-web-services-ltd` fails under bun 1.3.5:
  `chrome-launcher` cannot fetch the browser websocket URL. It needs to run
  under Node, or the launcher needs replacing, before the mission's final
  step can refresh `src/data/lighthouse.json`.
- `build-lighthouse.ts` takes **one** run per site. celery moved 12 points
  between runs at baseline, so the published project-card numbers are single
  samples. It should take a median of five.
- `bun run lint` fails with three pre-existing errors, untouched by this work:
  `react-refresh/only-export-components` in `ui/badge.tsx` and
  `ui/button.tsx`, and `react-hooks/set-state-in-effect` in
  `useCalculation.ts`. Out of scope here, but `verify` deliberately does not
  run lint because of them.
