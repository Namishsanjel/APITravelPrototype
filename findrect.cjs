// Rects of elements whose text contains a snippet (case-insensitive), both pages.
// Usage: node findrect.cjs <snippet> <url1> <url2>
const { chromium } = require('playwright');
const [, , SNIP, U1, U2] = process.argv;
(async () => {
  const browser = await chromium.launch();
  for (const url of [U1, U2]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const out = await page.evaluate((snip) => {
      const s = snip.toLowerCase();
      const hits = [];
      const walk = (el) => {
        if (el.children.length === 0 && (el.textContent || '').toLowerCase().includes(s)) {
          const r = el.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(el);
          const rr = range.getBoundingClientRect();
          const cs = getComputedStyle(el);
          hits.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || '').toString ? el.className.toString().slice(0, 44) : '',
            rect: `x${r.x.toFixed(3)} y${(r.y + scrollY).toFixed(3)} ${r.width.toFixed(3)}x${r.height.toFixed(3)}`,
            line: `x${rr.x.toFixed(3)} y${(rr.y + scrollY).toFixed(3)} ${rr.width.toFixed(3)}x${rr.height.toFixed(3)}`,
            lh: cs.lineHeight,
            pad: cs.padding,
            disp: cs.display,
            ai: cs.alignItems,
            wc: cs.willChange,
            parent: (() => { const p = el.parentElement; if (!p) return '-'; const pr = p.getBoundingClientRect(); const pcs = getComputedStyle(p); return `${p.tagName.toLowerCase()} y${(pr.y + scrollY).toFixed(3)} ${pr.width.toFixed(1)}x${pr.height.toFixed(1)} wc=${pcs.willChange}`; })(),
          });
        }
        for (const c of el.children) walk(c);
      };
      walk(document.body);
      return hits;
    }, SNIP);
    console.log('=== ' + url);
    out.forEach((h) => console.log('  ' + JSON.stringify(h)));
    await page.close();
  }
  await browser.close();
})();
