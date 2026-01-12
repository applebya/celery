# Celery - Recommendations

## High Priority

### 1. PWA Icons Missing
The following icons are referenced but don't exist in `/public`:
- `pwa-192x192.png`
- `pwa-512x512.png`
- `apple-touch-icon.png`

**Action:** Generate icons from the celery/salary theme. Can use tools like:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/nickreese/pwa-asset-generator)

### 2. Analytics Placeholder
`index.html` line 29 has `data-domain="YOUR_DOMAIN"` placeholder.

**Action:** Either:
- Update to `data-domain="celery.info"` (requires Plausible account)
- Remove the script if not using analytics

### 3. Open Graph Image
No `og:image` meta tag for social sharing previews.

**Action:** Add an OG image (1200x630px recommended):
```html
<meta property="og:image" content="https://celery.info/og-image.png" />
```

---

## Medium Priority

### 4. Add Tests
No test setup currently.

**Suggested:** Vitest + React Testing Library for unit tests, Playwright for E2E.

```bash
bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 5. Error Boundary
No error boundary to catch React crashes gracefully.

**Action:** Add an error boundary component wrapping `<App />`.

### 6. 404 Handling for SPA
GitHub Pages returns 404 for direct navigation to routes (if you add routing later).

**Action:** Add a `404.html` that redirects to `index.html` with the path preserved.

---

## Low Priority / Nice to Have

### 7. Accessibility Audit
- Run Lighthouse accessibility audit
- Ensure all interactive elements have proper labels
- Test keyboard navigation

### 8. Performance
- Consider lazy loading the comparison view
- Add `loading="lazy"` to any images

### 9. SEO
- Add canonical URL: `<link rel="canonical" href="https://celery.info/" />`
- Consider adding JSON-LD structured data for the calculator

### 10. Security Headers
If moving to a platform like Vercel/Cloudflare, add headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`

---

## Completed
- [x] GitHub Pages deployment
- [x] Custom domain (celery.info)
- [x] PWA service worker with offline caching
- [x] Light/dark/auto theme toggle
- [x] Exchange rate caching
