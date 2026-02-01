# External Integrations

**Analysis Date:** 2026-02-01

## APIs & External Services

**Currency Exchange Rates:**

- Frankfurter API (https://api.frankfurter.app) - Free currency conversion service backed by ECB
  - SDK/Client: Native fetch API calls
  - Auth: None required (public API)
  - Supported currencies: USD, CAD, EUR, GBP, MXN
  - Rate limiting: Implicit (respects cache headers)
  - Caching: 24-hour client-side cache via localStorage (configured in Workbox)
  - Historical data: Up to 1 year lookback for charting

**Fonts:**

- Google Fonts (https://fonts.googleapis.com, https://fonts.gstatic.com)
  - SDK/Client: Standard @font-face CSS
  - Auth: None required
  - Font: Inter (weights 400, 500, 600, 700)
  - Caching: 1-year lifetime cache via Workbox

## Data Storage

**Databases:**

- None - stateless client-only architecture

**Local Storage:**

- Browser localStorage (JSON serialization)
  - `celery-scenarios` - Saved calculator scenarios with state snapshots
  - `celery-exchange-rates` - Cached current exchange rates (TTL: 24 hours)
  - `celery-exchange-history` - Cached historical rate data (TTL: 24 hours)
  - `celery-calculator-left`, `celery-calculator-right` - Legacy storage keys (migrated to scenarios)

**File Storage:**

- None - all data client-side or external APIs

**Caching:**

- Workbox service worker (vite-plugin-pwa) with runtime caching rules:
  - frankfurter.app/\* → CacheFirst strategy (24-hour max age)
  - Google Fonts CSS → CacheFirst (1-year cache)
  - Google Fonts assets → CacheFirst (1-year cache)
  - App shell (HTML, JS, CSS) → Network first (rebuild on deploy)

## Authentication & Identity

**Auth Provider:**

- None - public tool, no user accounts
- No authentication or authorization layer
- No session management

## Monitoring & Observability

**Analytics & Event Tracking:**

- PostHog (https://us.i.posthog.com) - Privacy-focused analytics
  - SDK: posthog-js 1.244.0
  - Auth: API key via VITE_PUBLIC_POSTHOG_KEY
  - Tracking:
    - Pageviews: Auto-captured
    - Pageleaves: Auto-captured (session tracking)
    - Custom events: Optional via trackEvent() helper
  - Environment: Disabled in development (import.meta.env.DEV check)
  - Configuration: `src/lib/analytics.ts` handles initialization

**Error Tracking:**

- None configured - errors logged to browser console via ErrorBoundary component

**Logs:**

- Browser console logging only
- No centralized log aggregation

**Uptime Monitoring:**

- GitHub Actions cron job (`uptime.yml`)
  - Daily check at 6am PT (14:00 UTC)
  - Tests: HTTPS health, HTTP→HTTPS redirect, www redirect
  - On failure: Auto-creates GitHub Issue with `uptime-alert` label

## CI/CD & Deployment

**Hosting:**

- GitHub Pages (static hosting via `gh-pages` branch)
- Custom domain: celery.info (via CNAME record)
- HTTPS: Automatic via GitHub Pages

**CI Pipeline:**

- GitHub Actions (`.github/workflows/`)
  - Build job: Bun install, build, upload artifact
  - Test job: Unit tests (vitest), E2E tests (Playwright on Chromium)
  - Deploy job: GitHub Pages deployment
  - Env vars injected at build time: VITE_PUBLIC_POSTHOG_KEY, VITE_PUBLIC_POSTHOG_HOST

**Build Process:**

```bash
bun install --frozen-lockfile    # Install with lock file
bun run build                      # TypeScript check + Vite build → ./dist
bun run test:run                   # Unit tests
bun run test:e2e                   # Playwright E2E tests
```

## Environment Configuration

**Required env vars (production):**

- `VITE_PUBLIC_POSTHOG_KEY` - PostHog project token (embedded in CI secrets)
- `VITE_PUBLIC_POSTHOG_HOST` - PostHog API host (default: https://us.i.posthog.com)

**Optional env vars:**

- None currently optional (all have sensible defaults)

**Secrets location:**

- GitHub repository secrets (`.github/workflows/deploy.yml` reads VITE_PUBLIC_POSTHOG_KEY)
- No .env file committed; use GitHub Secrets for sensitive values

## Webhooks & Callbacks

**Incoming:**

- None - stateless client application

**Outgoing:**

- GitHub API: Auto-creates issues on uptime failures via actions/github-script
- PostHog API: Automatic pageview and pageleave captures via posthog-js

## Third-Party JavaScript

**CDN Scripts:**

- None inline loaded (all via npm modules)
- Google Fonts: CSS injected via preconnect, then @font-face

**Service Worker:**

- Workbox (via vite-plugin-pwa)
  - Auto-registers on first load
  - Auto-updates service worker between deploys
  - Handles offline functionality and asset caching

---

_Integration audit: 2026-02-01_
