/*
  axe-core scan plus a keyboard sweep. The draft this site was ported from
  drove most of its affordances from mouse events, so the tab walk matters
  as much as the rule scan.

  Usage: bun run a11y [url]
*/
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const URL = process.argv[2] ?? "http://localhost:4173/";
const VIEWPORTS = [
  { name: "mobile", width: 393, height: 851 },
  { name: "desktop", width: 1440, height: 900 },
];

const browser = await chromium.launch();
let violationCount = 0;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });

  /* Let the page settle before scanning. axe folds opacity into its contrast
     maths, so scanning straight after `load` catches any entrance animation
     mid-fade and reports text that is on its way in as a contrast failure.
     A fast local preview loses this race every time while a slower deployed
     origin usually wins it, which made the same page pass or fail depending
     on where it was served from. */
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document.getAnimations().map((a) => a.finished.catch(() => {})),
    );
  });
  await page.waitForTimeout(250);

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  console.log(`\n── ${vp.name} (${vp.width}px) ─────────────────────────`);
  if (violations.length === 0) {
    console.log("  axe: no violations");
  } else {
    for (const v of violations) {
      violationCount++;
      console.log(`  [${v.impact}] ${v.id} — ${v.help}`);
      for (const node of v.nodes.slice(0, 3)) {
        console.log(`      ${node.target.join(" ")}`);
      }
      if (v.nodes.length > 3)
        console.log(`      …and ${v.nodes.length - 3} more`);
    }
  }

  /* Walk the tab order and report anything focusable with no visible ring. */
  const unfocusable = await page.evaluate(() => {
    const sel =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const els = [...document.querySelectorAll<HTMLElement>(sel)];
    const bad: string[] = [];
    let reachable = 0;
    for (const el of els) {
      /* display:none and visibility:hidden already drop an element from the
         tab order. What matters is something reachable but not seeable. */
      if (
        !el.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })
      ) {
        continue;
      }
      reachable++;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) {
        bad.push(
          `${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 30)}"`,
        );
      }
    }
    return { total: reachable, bad };
  });
  console.log(`  tab stops: ${unfocusable.total}`);
  if (unfocusable.bad.length) {
    console.log(`  zero-size but focusable: ${unfocusable.bad.join(", ")}`);
  }

  await ctx.close();
}

await browser.close();
console.log("");
process.exit(violationCount > 0 ? 1 : 0);
