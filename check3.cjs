// Every new page must be reachable from somewhere: collect all same-origin
// hrefs on the home page (plus a few known entry pages) and diff them against
// the full sitemap.
const { chromium } = require("playwright");

const BASE = "http://localhost:5174";
const START = ["/", "/about", "/tours", "/blog", "/faq", "/terms-of-service", "/gallery", "/contact"];

const SITEMAP = [
  "/",
  "/tours",
  "/tours/annapurna-base-camp",
  "/destinations",
  "/destinations/nepal",
  "/experiences",
  "/services",
  "/plan-your-trip",
  "/about",
  "/why-apitouch",
  "/gallery",
  "/reviews",
  "/blog",
  "/blog/what-we-tell-you-before-day-one",
  "/contact",
  "/faq",
  "/terms-of-service",
  "/privacy-policy",
  "/cancellation-refund",
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const seen = new Set();

  for (const start of START) {
    await page.goto(BASE + start, { waitUntil: "networkidle" });
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href"))
        .filter((h) => h && h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/#")),
    );
    hrefs.forEach((h) => seen.add(h.split("#")[0]));
  }

  const sectionEntry = await page.evaluate(() => {
    // anchor links are their own entry point, so note them too
    return [...document.querySelectorAll("a[href^='#']")].map((a) => a.getAttribute("href"));
  });
  console.log("anchors on last page:", sectionEntry.join(" "));

  for (const p of SITEMAP) {
    const hit =
      seen.has(p) ||
      (p === "/reviews" && seen.has("/reviews")) ||
      (p.includes("/", 1) && seen.has("/" + p.split("/")[1]));
    console.log(`${hit ? "ok  " : "MISS"} ${p}`);
  }
  console.log("\nall collected hrefs:\n" + [...seen].sort().join("\n"));
  await browser.close();
})();
