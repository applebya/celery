import posthog from 'posthog-js';

// PostHog configuration via environment variables
// Create a .env file with VITE_PUBLIC_POSTHOG_KEY and VITE_PUBLIC_POSTHOG_HOST
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export function initAnalytics() {
  // Skip in development or if key not configured
  if (import.meta.env.DEV || !POSTHOG_KEY) {
    console.log('[Analytics] Skipped - development mode or key not configured');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Capture pageviews automatically
    capture_pageview: true,
    // Capture pageleaves for session recording
    capture_pageleave: true,
    // Disable in development
    loaded: (posthog) => {
      if (import.meta.env.DEV) posthog.opt_out_capturing();
    },
  });
}

// Helper to track custom events
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (POSTHOG_KEY) {
    posthog.capture(event, properties);
  }
}
