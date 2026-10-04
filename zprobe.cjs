// Exact positioning/z-index chain of the blur-up layers.
// Usage: node zprobe.cjs <url> <selector>
const { chromium } = require('playwright');
const url = process.argv[2];
const sel = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return [`NOT FOUND: ${sel}`];
    const lines = [];
    const walk = (el, d) => {
      const cs = getComputedStyle(el);
      const bf = cs.backdropFilter !== 'none';
      const interesting = bf || cs.zIndex !== 'auto' || cs.position !== 'static' || d < 6;
      if (interesting) {
        const r = el.getBoundingClientRect();
        lines.push(
          `${'  '.repeat(d)}<${el.tagName.toLowerCase()}> pos=${cs.position} z=${cs.zIndex} y${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)}` +
          (bf ? ` BF=${cs.backdropFilter}` : '') +
          ` cls="${el.className && el.className.toString ? el.className.toString().slice(0, 46) : ''}"`
        );
      }
      for (const c of el.children) walk(c, d + 1);
    };
    walk(root, 0);
    return lines;
  }, sel);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
