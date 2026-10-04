// List elements where computed text-transform != none.
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const rows = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const tt = getComputedStyle(el).textTransform;
      if (!tt || tt === 'none') continue;
      const direct = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
      if (!direct.trim()) continue;
      const r = el.getBoundingClientRect();
      out.push({ tt, raw: direct.trim().replace(/\s+/g, ' ').slice(0, 46), y: Math.round(r.y + scrollY), x: Math.round(r.x) });
    }
    return out;
  });
  console.log(`elements with text-transform: ${rows.length}`);
  rows.forEach((r) => console.log(`  ${r.tt.padEnd(10)} y${r.y} x${r.x} "${r.raw}"`));
  await browser.close();
})();
