// Dump SVG / icon geometry inside a y-range (one-off helper).
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
    for (const el of document.querySelectorAll('svg, [data-framer-name] > svg, [data-framer-input-icon]')) {
      const r = el.getBoundingClientRect();
      const y = r.y + scrollY;
      if (r.width < 2 || r.height < 2 || y + r.height < yMin || y > yMax) continue;
      const cs = getComputedStyle(el);
      const parent = el.parentElement;
      out.push(
        `svg ${Math.round(r.width)}x${Math.round(r.height)} | x${Math.round(r.x)},y${Math.round(y)}` +
        ` | fill ${cs.fill} | stroke ${cs.stroke} | parent[${parent && parent.getAttribute('data-framer-name')}]` +
        ` pbox ${parent ? Math.round(parent.getBoundingClientRect().x) + ',' + Math.round(parent.getBoundingClientRect().y + scrollY) + ' ' + Math.round(parent.getBoundingClientRect().width) + 'x' + Math.round(parent.getBoundingClientRect().height) : ''}` +
        ` | html ${(el.outerHTML || '').slice(0, 200).replace(/\s+/g, ' ')}`
      );
    }
    return out;
  }, { yMin, yMax });
  rows.forEach((r) => console.log(r));
  await browser.close();
})();
