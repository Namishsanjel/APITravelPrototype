// Dump descendant tree (tag, rect, bg, opacity, display) of first match.
// Usage: node tree.cjs <url> <selector>
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
    const r2 = (n) => Math.round(n * 100) / 100;
    const lines = [];
    const walk = (el, d) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const bg = cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 90) : '';
      lines.push(
        `${'  '.repeat(d)}<${el.tagName.toLowerCase()}> x${r2(r.x)},y${r2(r.y + scrollY)},${r2(r.width)}x${r2(r.height)}` +
        ` pos=${cs.position} op=${cs.opacity} disp=${cs.display} z=${cs.zIndex}` +
        (bg ? ` bg="${bg}"` : '') +
        (el.textContent && !el.children.length ? ` "${(el.textContent || '').trim().slice(0, 30)}"` : '')
      );
      for (const c of el.children) walk(c, d + 1);
    };
    walk(root, 0);
    return lines;
  }, sel);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
