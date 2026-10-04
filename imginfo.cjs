// Dump every rendered <img> with full src, geometry, natural size, fit/position.
// Usage: node imginfo.cjs <url> [yMin]
const { chromium } = require('playwright');
const url = process.argv[2];
const yMin = Number(process.argv[3] || 0);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else { window.scrollTo(0, 0); setTimeout(res, 300); } };
      s();
    });
  });
  await page.waitForTimeout(2500);
  const rows = await page.evaluate((yMin) => [...document.images]
    .map((img) => {
      const r = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      return {
        src: img.currentSrc || img.src,
        x: Math.round(r.x), y: Math.round(r.y + scrollY),
        w: Math.round(r.width), h: Math.round(r.height),
        nw: img.naturalWidth, nh: img.naturalHeight,
        fit: cs.objectFit, pos: cs.objectPosition,
        complete: img.complete,
      };
    })
    .filter((i) => i.w > 4 && i.y >= yMin)
    .sort((a, b) => a.y - b.y), yMin);
  rows.forEach((r) =>
    console.log(`y${r.y} x${r.x} ${r.w}x${r.h} nat=${r.nw}x${r.nh} fit=${r.fit} pos=${r.pos} ok=${r.complete}\n    ${r.src}`)
  );
  await browser.close();
})();
