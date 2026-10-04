// Dump every element intersecting a rect (x0,y0,x1,y1) with a short html snippet.
const { chromium } = require('playwright');
const [url, x0, y0, x1, y1] = process.argv.slice(2);
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
  const rows = await page.evaluate(({ x0, y0, x1, y1 }) => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      const y = r.y + scrollY;
      if (r.width < 1 || r.height < 1) continue;
      const cx = r.x + r.width / 2, cy = y + r.height / 2;
      if (cx < x0 || cx > x1 || cy < y0 || cy > y1) continue;
      const cs = getComputedStyle(el);
      out.push(
        `${el.tagName}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''}` +
        ` | x${Math.round(r.x)},y${Math.round(y)},${Math.round(r.width)}x${Math.round(r.height)}` +
        ` | bg ${cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 70) : cs.backgroundColor}` +
        ` | ${cs.position} | html ${(el.outerHTML || '').slice(0, 220).replace(/\s+/g, ' ')}`
      );
    }
    return out;
  }, { x0: Number(x0), y0: Number(y0), x1: Number(x1), y1: Number(y1) });
  rows.forEach((r) => console.log(r));
  await browser.close();
})();
