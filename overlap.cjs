// All elements intersecting a rect, with paint-relevant styles (z, blend, opacity, bg, mask).
// Usage: node overlap.cjs <url> <x> <y> <w> <h>
const { chromium } = require('playwright');
const url = process.argv[2];
const [X, Y, W, H] = process.argv.slice(3).map(Number);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate(({ X, Y, W, H }) => {
    const lines = [];
    const walk = (el, d) => {
      const r = el.getBoundingClientRect();
      const top = r.y + scrollY;
      const inter =
        r.width > 0 && r.height > 0 &&
        r.x < X + W && r.x + r.width > X &&
        top < Y + H && top + r.height > Y;
      if (inter) {
        const cs = getComputedStyle(el);
        const bits = [];
        if (cs.opacity !== '1') bits.push(`OP=${cs.opacity}`);
        if (cs.filter !== 'none') bits.push(`filter=${cs.filter}`);
        if (cs.mixBlendMode !== 'normal') bits.push(`blend=${cs.mixBlendMode}`);
        if (cs.isolation !== 'auto') bits.push(`iso=${cs.isolation}`);
        if (cs.maskImage !== 'none') bits.push(`mask=${cs.maskImage.slice(0, 70)}`);
        if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bits.push(`bgc=${cs.backgroundColor}`);
        if (cs.backgroundImage !== 'none') bits.push(`bgi=${cs.backgroundImage.slice(0, 60)}`);
        if (cs.position !== 'static') bits.push(`pos=${cs.position}`);
        if (cs.zIndex !== 'auto') bits.push(`z=${cs.zIndex}`);
        if (cs.overflow !== 'visible') bits.push(`ov=${cs.overflow}`);
        lines.push(
          `${'  '.repeat(Math.min(d, 8))}<${el.tagName.toLowerCase()}> y${Math.round(top)},${Math.round(r.x)},${Math.round(r.width)}x${Math.round(r.height)}` +
          (bits.length ? ' ' + bits.join(' ') : '') + ` cls="${(el.className || '').toString ? el.className.toString().slice(0, 30) : ''}"`
        );
      }
      for (const c of el.children) walk(c, d + 1);
    };
    walk(document.body, 0);
    return lines;
  }, { X, Y, W, H });
  out.forEach((l) => console.log(l));
  await browser.close();
})();
