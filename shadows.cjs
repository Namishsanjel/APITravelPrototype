// Full box-shadows / borders of a handful of elements.
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => { let y = 0; const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else res(); }; s(); });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const res = [];
    const seen = new Set();
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 8) continue;
      const key = cs.boxShadow + '|' + cs.borderBottom;
      if (cs.boxShadow && cs.boxShadow !== 'none' && !seen.has(key)) {
        seen.add(key);
        res.push({ kind: 'shadow', name: el.getAttribute('data-framer-name') || el.tagName, x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), v: cs.boxShadow.slice(0, 300) });
      }
      if (cs.borderBottomWidth !== '0px' && cs.borderBottomStyle !== 'none' && !seen.has('b|' + key)) {
        seen.add('b|' + key);
        res.push({ kind: 'border', name: el.getAttribute('data-framer-name') || el.tagName, x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), v: cs.borderBottom });
      }
    }
    return res;
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
