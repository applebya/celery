/*
  Field-measurement harness. Mirrors the method documented in the Spacelift
  modernization results so the two sites' numbers are comparable:
  Pixel 5 viewport, Slow-4G, 4x CPU throttle, median of three runs.

  Usage: bun run perf            (measures http://localhost:4173)
         bun run perf <url>
*/
import { chromium, type Page } from "playwright";

const URL = process.argv[2] ?? "http://localhost:4173/";
const RUNS = 3;

const MOBILE = {
  viewport: { width: 393, height: 851 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
};

const SLOW_4G = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
};

interface Sample {
  lcp: number;
  cls: number;
  fcp: number;
  bytes: number;
  requests: number;
  imageBytes: number;
}

async function collect(page: Page): Promise<Sample> {
  return page.evaluate(
    () =>
      new Promise<Sample>((resolve) => {
        let lcp = 0;
        let cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            const s = e as PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            };
            if (!s.hadRecentInput) cls += s.value;
          }
        }).observe({ type: "layout-shift", buffered: true });

        setTimeout(() => {
          const res = performance.getEntriesByType(
            "resource",
          ) as PerformanceResourceTiming[];
          const nav = performance.getEntriesByType("navigation")[0] as
            PerformanceNavigationTiming | undefined;
          const fcp =
            performance.getEntriesByName("first-contentful-paint")[0]
              ?.startTime ?? 0;
          const bytes =
            res.reduce((a, r) => a + r.transferSize, 0) +
            (nav?.transferSize ?? 0);
          const imageBytes = res
            .filter(
              (r) =>
                r.initiatorType === "img" ||
                /\.(avif|webp|jpg|png)/.test(r.name),
            )
            .reduce((a, r) => a + r.transferSize, 0);
          resolve({
            lcp,
            cls,
            fcp,
            bytes,
            requests: res.length + 1,
            imageBytes,
          });
        }, 6000);
      }),
  );
}

const median = (xs: number[]) =>
  [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
const ms = (n: number) => `${(n / 1000).toFixed(2)} s`;

const browser = await chromium.launch();
const samples: Sample[] = [];

for (let i = 0; i < RUNS; i++) {
  const ctx = await browser.newContext(MOBILE);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.emulateNetworkConditions", SLOW_4G);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.goto(URL, { waitUntil: "load", timeout: 120_000 });
  samples.push(await collect(page));
  await ctx.close();
  process.stderr.write(`run ${i + 1}/${RUNS} done\n`);
}

await browser.close();

const r = {
  lcp: median(samples.map((s) => s.lcp)),
  cls: median(samples.map((s) => s.cls)),
  fcp: median(samples.map((s) => s.fcp)),
  bytes: median(samples.map((s) => s.bytes)),
  requests: median(samples.map((s) => s.requests)),
  imageBytes: median(samples.map((s) => s.imageBytes)),
};

const verdict = (ok: boolean) => (ok ? "PASS" : "FAIL");

console.log(`
  ${URL}
  Pixel 5 · Slow-4G · 4x CPU · median of ${RUNS}

  LCP        ${ms(r.lcp).padStart(8)}   target < 2.50 s   ${verdict(r.lcp < 2500)}
  CLS        ${r.cls.toFixed(4).padStart(8)}   target < 0.05     ${verdict(r.cls < 0.05)}
  FCP        ${ms(r.fcp).padStart(8)}
  Transfer   ${kb(r.bytes).padStart(8)}   target < 900 KB   ${verdict(r.bytes < 900 * 1024)}
  Images     ${kb(r.imageBytes).padStart(8)}
  Requests   ${String(r.requests).padStart(8)}
`);

const failed = r.lcp >= 2500 || r.cls >= 0.05 || r.bytes >= 900 * 1024;
process.exit(failed ? 1 : 0);
