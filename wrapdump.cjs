// Dump textWrap + line count for every multi-line text element, ref vs port.
const { chromium } = require('playwright');
const [A, B, MINY = '0', MAXY = '99999'] = process.argv.slice(2);
const RANGE = [Number(MINY), Number(MAXY)];

const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);
  return page.evaluate((range) => {
    const out = [];
    const seen = new Set();
    for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,div,li')) {
      if (el.children.length > 0) continue; // leaf only
      const text = (el.textContent || '').trim();
      if (!text || text.length < 12) continue;
      const r = el.getBoundingClientRect();
      const y = r.top + window.scrollY;
      if (y < range[0] || y > range[1]) continue;
      const cs = getComputedStyle(el);
      const lines = Math.max(1, Math.round(r.height / (parseFloat(cs.lineHeight) || 20)));
      if (lines < 2) continue;
      const key = text.slice(0, 40);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        y: Math.round(y),
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 40),
        wrap: cs.textWrap,
        lines,
        text: text.slice(0, 55),
      });
    }
    return out.sort((x, y) => x.y - y.y);
  }, RANGE);
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const a = await PROBE(page, A);
  const b = await PROBE(page, B);
  console.log('A(ref)=' + A);
  a.forEach((l) => console.log(`  y${l.y} <${l.tag}> wrap=${l.wrap} x${l.lines} "${l.text}"`));
  console.log('B(port)=' + B);
  b.forEach((l) => console.log(`  y${l.y} <${l.tag}> wrap=${l.wrap} x${l.lines} "${l.text}"`));
  await browser.close();
})();
