// Dump styled containers (bg / radius / border / padding) in a y-range.
// Usage: node boxes.cjs <url> [yMin] [yMax]
const { chromium } = require('playwright');
const url = process.argv[2];
const yMin = Number(process.argv[3] ?? 0);
const yMax = Number(process.argv[4] ?? 1e9);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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
      if (r.width < 4 || r.height < 4 || y + r.height < yMin || y > yMax) continue;
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const radius = cs.borderRadius;
      const hasRadius = radius && radius !== '0px' && !radius.split(' ').every((v) => v === '0px');
      const bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth);
      const hasBorder = bw > 0 && cs.borderTopStyle !== 'none';
      if (bg === 'rgba(0, 0, 0, 0)' && !hasRadius && !hasBorder) continue;
      // skip noise: full-width section wrappers with cream bg already known
      const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28);
      out.push(
        `${el.tagName}${el.className && typeof el.className === 'string' && el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''}` +
        ` | x${Math.round(r.x)},y${Math.round(y)},${Math.round(r.width)}x${Math.round(r.height)}` +
        ` | bg ${bg} | r ${radius}` +
        (hasBorder ? ` | bd ${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}` : '') +
        ` | pad ${cs.padding}` +
        (txt ? ` | "${txt}"` : '')
      );
    }
    return out;
  }, { yMin, yMax });
  rows.forEach((r) => console.log(r));
  await browser.close();
})();
