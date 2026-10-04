// Dump named structural containers (data-framer-name / section / header / main / nav / footer).
// Usage: node names.cjs <url> [yMin] [yMax]
const { chromium } = require('playwright');
const url = process.argv[2];
const yMin = Number(process.argv[3] ?? 0);
const yMax = Number(process.argv[4] ?? 1e9);
const vw = Number(process.argv[5] ?? 1440);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: vw, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else { window.scrollTo(0, 0); setTimeout(res, 300); } };
      s();
    });
  });
  await page.waitForTimeout(2500);
  const rows = await page.evaluate(({ yMin, yMax }) => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      const y = r.y + scrollY;
      if (r.height < 8 || y + r.height < yMin || y > yMax) continue;
      const name = el.getAttribute('data-framer-name');
      const structural = ['SECTION', 'HEADER', 'NAV', 'MAIN', 'FOOTER'].includes(el.tagName);
      if (!name && !structural) continue;
      const cs = getComputedStyle(el);
      out.push(
        `${el.tagName}${name ? `[${name}]` : ''} | x${Math.round(r.x)},y${Math.round(y)},${Math.round(r.width)}x${Math.round(r.height)}` +
        ` | pos ${cs.position} | pad ${cs.padding} | gap ${cs.gap} | ${cs.display}`
      );
    }
    return out;
  }, { yMin, yMax });
  rows.forEach((r) => console.log(r));
  await browser.close();
})();
