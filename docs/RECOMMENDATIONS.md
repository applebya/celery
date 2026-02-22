# Celery - Recommendations

## Remaining Items

### Error Boundary
No error boundary to catch React crashes gracefully.

**Action:** Add an error boundary component wrapping `<App />`.

### 404 Handling for SPA
GitHub Pages returns 404 for direct navigation to routes (if you add routing later).

**Action:** Add a `404.html` that redirects to `index.html` with the path preserved.

### Performance
- Consider lazy loading the comparison view
- Add `loading="lazy"` to any images

### SEO
- Add canonical URL: `<link rel="canonical" href="https://celery.info/" />`
- Consider adding JSON-LD structured data for the calculator

### Security Headers
If moving to a platform like Vercel/Cloudflare, add headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`

### Analytics
PostHog is initialized in `src/lib/analytics.ts` when env vars are set.

---

## Completed
- [x] GitHub Pages deployment
- [x] Custom domain (celery.info)
- [x] PWA service worker with offline caching
- [x] Light/dark/auto theme toggle
- [x] Exchange rate caching
- [x] PWA icons (192x192, 512x512, apple-touch-icon)
- [x] OG image for social sharing (1200x630)
- [x] Twitter card meta tags
- [x] Unit tests with Vitest (74 tests passing)
- [x] Accessibility audit with axe-core
- [x] Aria labels on all interactive elements
- [x] Custom favicon (celery stalk design)
