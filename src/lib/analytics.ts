// PostHog configuration via environment variables
// Create a .env file with VITE_PUBLIC_POSTHOG_KEY and VITE_PUBLIC_POSTHOG_HOST
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

type PostHog = (typeof import("posthog-js"))["default"];

let posthog: PostHog | null = null;

/* Events fired before the module finishes loading are held here rather than
   dropped, then flushed in order once PostHog is live. */
let pending: [string, Record<string, unknown> | undefined][] = [];

/*
  PostHog is loaded dynamically, after the page is idle.

  Imported statically it landed in the entry chunk, so the analytics client
  had to download, parse and execute before anything could paint — and it
  then pulled another ~46 KB of add-on scripts on top. None of that is worth
  a share of LCP on a page whose whole job is to show a number.
*/
export function initAnalytics() {
  if (import.meta.env.DEV || !POSTHOG_KEY) return;

  const start = () => {
    void import("posthog-js").then(({ default: ph }) => {
      ph.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: true,
        capture_pageleave: true,
        /* Surveys (33 KB) and dead-click autocapture (9 KB) are the two
           heaviest add-ons and neither is used by this site. */
        disable_surveys: true,
        capture_dead_clicks: false,
      });
      posthog = ph;
      for (const [event, properties] of pending) ph.capture(event, properties);
      pending = [];
    });
  };

  /* Idle if the browser offers it, with a timeout so the call still happens
     on a page that never goes idle; a plain delay otherwise. */
  if ("requestIdleCallback" in window) {
    requestIdleCallback(start, { timeout: 5000 });
  } else {
    setTimeout(start, 2000);
  }
}

// Helper to track custom events
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (import.meta.env.DEV || !POSTHOG_KEY) return;
  if (posthog) posthog.capture(event, properties);
  else pending.push([event, properties]);
}
