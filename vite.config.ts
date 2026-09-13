import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ filename: "bundle-stats.html", gzipSize: true }),
    VitePWA({
      registerType: "autoUpdate",
      /* Inline the registration snippet instead of emitting registerSW.js.
         As a separate file it was a render-blocking request for ~300 ms and
         all it does is call navigator.serviceWorker.register. */
      injectRegister: "inline",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Celery - Salary Calculator",
        short_name: "Celery",
        description:
          "Calculate your annual take-home pay. Hourly rate to salary with tax estimates.",
        theme_color: "#22c55e",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        /* Fonts are deliberately excluded from the precache. Every font here
           is declared with a unicode-range, so the browser downloads only the
           subset it actually needs; precaching the glob pulled all of them
           (latin-ext and vietnamese included) and pushed the precache to
           1296 KiB. They are picked up by the runtime cache below on first
           real use instead. */
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.frankfurter\.app\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "exchange-rate-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            /* Self-hosted fonts: same-origin, cached on first use. The
               google-fonts and gstatic rules that used to live here went out
               with the third-party font CDNs. */
            urlPattern: ({ request }) => request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "font-cache",
              expiration: {
                maxEntries: 12,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    /* Lighthouse best-practices flags first-party bundles with no source map,
       and finds the map via the //# sourceMappingURL comment — so this has to
       be `true`, not `hidden`. Browsers only fetch a .map when devtools is
       open, so the cost to a real visitor is the comment and nothing else. */
    sourcemap: true,
    /* Matches tsconfig's ES2022. The default ("modules") transpiles down far
       enough to ship ~8 KB of helpers for syntax every browser we support
       has had natively for years. */
    target: "es2022",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
