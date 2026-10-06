// Scan several routes for horizontal overflow after the font swap.
const { chromium } = require("playwright");

const routes = [
  "/",
  "/about",
  "/destinations",
  "/experiences",
  "/hikes",
  "/gallery",
  "/why",
  "/faq",
  "/reviews",
  "/contact",
  "/plan-trip",
  "/services",
  "/journal",
  "/legal",
];

(async () => {
  const base = process.argv[2] || "http://localhost:5174";
  const width = Number(process.argv[3] || 1440);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 900 } });

  for (const r of routes) {
    try {
      await page.goto(base + r, { waitUntil: "networkidle", timeout: 20000 });
      await page.evaluate(() => document.fonts.ready);
      const res = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const wide = [...document.querySelectorAll("h1,h2,h3,h4,p,a,span,button")]
          .filter((e) => e.getBoundingClientRect().right > vw + 1)
          .slice(0, 4)
          .map((e) => `${e.tagName}.${(e.className || "").toString().slice(0, 40)} "${(e.textContent || "").trim().slice(0, 30)}"`);
        return {
          hOverflow: document.documentElement.scrollWidth - vw,
          wide,
        };
      });
      console.log(r.padEnd(16), "scrollΔ", String(res.hOverflow).padStart(5), res.wide.length ? JSON.stringify(res.wide) : "");
    } catch (e) {
      console.log(r.padEnd(16), "ERR", e.message.split("\n")[0]);
    }
  }
  await browser.close();
})();
