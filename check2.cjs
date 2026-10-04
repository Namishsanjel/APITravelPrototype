// Layout / asset health check: broken images, horizontal overflow, at two widths.
const { chromium } = require("playwright");

const BASE = "http://localhost:5174";
const ROUTES = [
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
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    console.log("\n######## viewport " + width);
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      const r = await page.evaluate(() => {
        const broken = [...document.images]
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.currentSrc || i.src);
        const doc = document.documentElement;
        const wide = [...document.querySelectorAll("main *")]
          .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
          .slice(0, 3)
          .map((el) => `${el.tagName}.${(el.className || "").toString().slice(0, 40)}@${Math.round(el.getBoundingClientRect().right)}`);
        return {
          scrollW: doc.scrollWidth,
          clientW: doc.clientWidth,
          broken,
          wide,
        };
      });
      const over = r.scrollW > r.clientW + 1;
      const flags = [];
      if (over) flags.push(`OVERFLOW ${r.scrollW}>${r.clientW} [${r.wide.join(" | ")}]`);
      if (r.broken.length) flags.push("BROKEN IMG: " + r.broken.join(", "));
      console.log(`${flags.length ? "!! " : "ok "} ${route}${flags.length ? "  " + flags.join("  ") : ""}`);
    }
    await page.close();
  }
  await browser.close();
})();
