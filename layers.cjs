// Computed style dump for card image layers.
// Usage: node layers.cjs <url> <selector-of-card>
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
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const bits = [];
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bits.push(`bgc=${cs.backgroundColor}`);
      if (cs.backgroundImage !== 'none') bits.push(`bgi=${cs.backgroundImage.slice(0, 60)}`);
      if (cs.filter !== 'none') bits.push(`filter=${cs.filter}`);
      if (cs.mixBlendMode !== 'normal') bits.push(`blend=${cs.mixBlendMode}`);
      if (cs.opacity !== '1') bits.push(`op=${cs.opacity}`);
      if (cs.boxShadow !== 'none') bits.push(`shadow=${cs.boxShadow.slice(0, 70)}`);
      if (cs.transform !== 'none') bits.push(`tf=${cs.transform.slice(0, 40)}`);
      if (cs.backdropFilter && cs.backdropFilter !== 'none') bits.push(`backdrop=${cs.backdropFilter}`);
      if (cs.overflow !== 'visible') bits.push(`ov=${cs.overflow}`);
      if (cs.borderRadius !== '0px') bits.push(`r=${cs.borderRadius}`);
      if (bits.length) lines.push(`${'  '.repeat(d)}<${el.tagName.toLowerCase()}> y${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)} ${bits.join(' ')}`);
      for (const c of el.children) walk(c, d + 1);
    };
    walk(root, 0);
    return lines;
  }, sel);
  if (!out.length) lines = [];
  out.forEach((l) => console.log(l));
  await browser.close();
})();
