# Showcase readiness — celery

Follow-ups before celery.info is highlighted on the corp site. The
cross-project list lives in `~/dev/.missions/showcase-readiness.md`; this is
the celery-specific slice.

Verified in a browser 2026-09-13: onboarding renders, the calculator loads
from its lazy chunk, changing the hourly rate recomputes, state persists
across a reload, currency conversion fetches successfully, no console errors.
Deployed scores: perf 99, accessibility 100, best practices 100, SEO 100.

## Blocking

- [ ] **Resolve the uncommitted working tree.** ~850 lines since February —
      `NewScenarioFlow`, `CompensationInsights`, an analytics rework — and
      local `main` is 10 commits behind `origin/main`. Pulling will conflict
      in `src/App.tsx`, `src/index.css`, `src/lib/analytics.ts` and
      `index.html`, all touched by the perf work. Finish it or shelve it on a
      branch; goodgradients lost a whole search feature inside exactly this
      kind of drift.

## Correctness

- [ ] **Add a check that the exchange-rate API still answers.** Currency
      conversion was broken in production for an unknown period: Frankfurter
      moved to `api.frankfurter.dev/v1`, the old host now 301s, and a browser
      will not follow a redirect on a cross-origin fetch. It failed silently
      — the UI simply never received rates. No test covers that call.
- [ ] **`bun run lint` fails** with three pre-existing errors
      (`react-refresh/only-export-components` in `ui/badge.tsx` and
      `ui/button.tsx`, `react-hooks/set-state-in-effect` in
      `useCalculation.ts`). `verify` skips lint because of them. Fix, then add
      lint to the gate.
- [ ] **Check whether deploy gates on tests.** If the `deploy` job does not
      depend on `test`, a red suite will ship — that is how goodgradients
      stayed broken for months.
- [ ] **Confirm the 2026 tax data is current** and the disclaimer still reads
      correctly before this is promoted as a portfolio piece.

## Accessibility

- [ ] `tools/audit-a11y.ts` scans the **initial view only**, so its "no
      violations" covers the onboarding screen and nothing behind it. Drive it
      through the calculator and compare views before trusting the 100.
- [ ] The onboarding screen only gained a `<main>` landmark during this
      mission, and it is the only view a first-time visitor ever sees. Worth
      auditing the rest of the app for the same class of omission.

## Performance

Perf is 99. The gap is LCP (~2110ms against the ~1555ms that would round the
total to 100), and LCP sits ~500ms behind celery's own FCP. tifftodo reaches
100 because its LCP *equals* its FCP — that is the shape to aim at. Detail and
method in `perf-results.md`.

- [ ] The remaining structural item is cache headers, which GitHub Pages does
      not expose. That is the open `NA-lh-2` hosting question, not a payload
      problem — payload is no longer the constraint here.
