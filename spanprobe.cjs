// Per-child rects + font metrics for elements matching a selector.
// Usage: node spanprobe.cjs <url> <selector> [nth, 1-based]
const { chromium } = require('playwright');
const url = process.argv[2];
const sel = process.argv[3];
const nth = Number(process.argv[4] || 1);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate(({ sel, nth }) => {
    const el = document.querySelectorAll(sel)[nth - 1];
    if (!el) return [`NOT FOUND: ${sel} (#${nth})`];
    const cs = getComputedStyle(el);
    const lines = [
      `el <${el.tagName.toLowerCase()}> ${Math.round(el.getBoundingClientRect().x)},${Math.round(el.getBoundingClientRect().y + scrollY)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`,
      `  font ${cs.fontFamily} ${cs.fontSize}/${cs.lineHeight} w${cs.fontWeight} ls${cs.color} al${cs.textAlign} ls=${cs.letterSpacing} fvs=${cs.fontVariationSettings} fstretch=${cs.fontStretch} fopt=${cs.fontOpticalSizing} kerning=${cs.fontKerning} textwrap=${cs.textWrap}`,
      `  loaded: ${document.fonts.check(cs.fontSize + ' ' + JSON.stringify(cs.fontFamily.split(',')[0].replace(/"/g, '')))}`,
    ];
    for (const child of el.children) {
      const r = child.getBoundingClientRect();
      const c = getComputedStyle(child);
      lines.push(`  <${child.tagName.toLowerCase()}> "${child.textContent}" x${Math.round(r.x)},y${Math.round(r.y + scrollY)},w${round2(r.width)}x${round2(r.height)} ls=${c.letterSpacing} display=${c.display}`);
    }
    return lines;
    function round2(n) { return Math.round(n * 100) / 100; }
  }, { sel, nth });
  out.forEach((l) => console.log(l));
  await browser.close();
})();
