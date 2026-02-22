# Celery - Contractor Salary Calculator

A lightweight, offline-first salary calculator for contractors in Canada and the USA. Convert hourly rates to annual compensation with tax estimates and total comp extras.

## Features

- **Hourly to Annual**: Calculate annual gross and net income from hourly rate
- **Tax Estimates**: 2026 federal + provincial/state tax brackets
- **Self-Employment Taxes**: CPP (Canada) and SE tax (US) calculations
- **Extras & Total Comp**: Bonuses, sign-on, equity, stipends, and employer match
- **Holiday Presets**: Province/state-specific statutory holidays for CA and US
- **Currency Conversion**: Live CAD/USD exchange rates with offline caching
- **Comparison Mode**: Compare two scenarios side-by-side
- **Offline-First**: PWA that works without internet
- **Privacy-Focused**: All data stored locally, no accounts needed

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** for styling
- **Vitest** for testing (58 tests)
- **vite-plugin-pwa** for offline support
- **PostHog** for privacy-friendly analytics

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```

## Deployment

### GitHub Pages

1. Update `vite.config.ts` with your base path:
   ```ts
   export default defineConfig({
     base: '/celery/',
     // ...
   })
   ```

2. Build and deploy:
   ```bash
   bun run build
   # Deploy dist/ folder to GitHub Pages
   ```

### Analytics

Replace `YOUR_DOMAIN` in `index.html` with your actual domain to enable Plausible analytics.

## Tax Data Sources

- Canada: 2026 federal and provincial tax brackets
- USA: 2026 federal and state tax brackets (single filer), standard deduction
- Canada: Federal and provincial basic personal amounts (BPA)
- Payroll taxes: CPP/EI (CA), FICA (US)
- Self-employment: CPP/CPP2 (CA), Social Security + Medicare (US)

**Disclaimer**: Tax estimates are rough approximations. Assumes single filer with no deductions or credits. Consult a tax professional for accurate calculations.

## License

MIT
