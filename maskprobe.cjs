// Print exact mask properties of the blur-layer parent + its outerHTML.
// Usage: node maskprobe.cjs <url> <selector>
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
    const layer = [...root.querySelectorAll('*')].find((e) => (getComputedStyle(e).backdropFilter || '').includes('0.078'));
    if (!layer) return ['layer not found'];
    let p = layer.parentElement;
    for (let i = 0; p && i < 4; i++, p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.maskImage !== 'none' || cs.webkitMaskImage !== 'none') {
        lines.push(`MASKED anc${i}:`);
        lines.push(`  maskImage      = ${cs.maskImage}`);
        lines.push(`  webkitMask    = ${cs.webkitMaskImage}`);
        lines.push(`  maskSize      = ${cs.maskSize || cs.webkitMaskSize}`);
        lines.push(`  maskPosition  = ${cs.maskPosition || cs.webkitMaskPosition}`);
        lines.push(`  maskRepeat    = ${cs.maskRepeat || cs.webkitMaskRepeat}`);
        lines.push(`  maskMode      = ${cs.maskMode}`);
        lines.push(`  maskComposite = ${cs.maskComposite}`);
        lines.push(`  opacity       = ${cs.opacity}`);
        lines.push(`  style attr    = ${p.getAttribute('style')}`);
        lines.push(`  html          = ${p.outerHTML.slice(0, 500)}`);
      }
    }
    // also: the mask owner may be an ancestor with inline style containing mask
    return lines.length ? lines : ['no masked ancestor found'];
  }, sel);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
