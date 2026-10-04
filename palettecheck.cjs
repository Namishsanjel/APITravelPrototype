/* Screenshot the rebranded palette (blue / yellow / cream) off the preview build. */
const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:4173";
const OUT = "shots/palette";

const SHOTS = [
  ["/", "home-hero", 0],
  ["/", "home-about", 1100],
  ["/", "home-included", 3200],
  ["/", "home-footer", 999999],
  ["/tours", "tours", 0],
  ["/tours", "tours-filters", 700],
  ["/contact", "contact", 0],
  ["/faq", "faq", 500],
  ["/reviews", "reviews", 400],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const [url, name, scroll] of SHOTS) {
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.evaluate((y) => window.scrollTo(0, y), scroll);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log("shot", name);
  }

  // hover states: nav link over the hero photo, then a primary button
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.hover("header nav a");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/hover-nav.png` });

  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(1800);
  const btn = await page.$("a.btn");
  if (btn) {
    await btn.hover();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/hover-btn.png` });
  }

  // filter pill hover on the listing page
  await page.goto(BASE + "/tours", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(1800);
  const trigger = await page.$('button[aria-haspopup="true"]');
  if (trigger) {
    await trigger.click();
    await page.waitForTimeout(500);
    const pill = await page.$('button[aria-pressed="false"]');
    if (pill) await pill.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/hover-filter.png` });
  }

  await browser.close();
})();
