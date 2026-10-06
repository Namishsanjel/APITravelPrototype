// Report the computed faces on key elements and screenshot the page.
const { chromium } = require("playwright");

(async () => {
  const url = process.argv[2] || "http://localhost:5173/";
  const width = Number(process.argv[3] || 1440);
  const out = process.argv[4] || "shots/font-check.png";
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(Number(process.argv[5] || 400));

  const info = await page.evaluate(() => {
    const face = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return `${cs.fontFamily.split(",")[0]} ${cs.fontSize} w${cs.fontWeight}`;
    };
    const loaded = [...document.fonts]
      .filter((f) => f.status === "loaded")
      .map((f) => `${f.family} ${f.weight} ${f.style}`);
    return {
      h1: face("h1, .t-h1"),
      h2: face("h2, .t-h2"),
      body: face("p, .t-body"),
      nav: face("header a"),
      btn: face("a.btn, .btn"),
      loaded: [...new Set(loaded)],
      hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: out });
  await browser.close();
})();
