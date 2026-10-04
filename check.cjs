// Text-level smoke test: loads each route and prints title, h1, nav labels
// and a few key links, so we can verify the pages without eyeballing PNGs.
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
  "/hikes",
  "/journal",
  "/hikes/laugavegur-trail",
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const data = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim() ?? "(none)",
      nav: [...document.querySelectorAll("header a")].map((a) => a.innerText.trim()).filter(Boolean).join(" | "),
      h2: [...document.querySelectorAll("main h2")].slice(0, 6).map((h) => h.innerText.replace(/\s+/g, " ").trim()).join(" / "),
      links: [...new Set([...document.querySelectorAll("main a")].map((a) => a.getAttribute("href")))].slice(0, 14).join(" "),
      url: location.pathname,
    }));
    console.log("\n== " + route + "  -> " + data.url);
    console.log("   title: " + data.title);
    console.log("   h1: " + data.h1);
    console.log("   nav: " + data.nav);
    if (data.h2) console.log("   h2: " + data.h2);
    if (data.links) console.log("   links: " + data.links);
  }

  if (errors.length) console.log("\nPAGE ERRORS:\n" + errors.join("\n"));
  await browser.close();
})();
