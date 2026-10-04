// Print exact mask/backdrop properties of each blur layer.
// Usage: node maskprobe2.cjs <url> <selector>
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
    const layers = [...root.querySelectorAll('*')].filter((e) => (getComputedStyle(e).backdropFilter || '').includes('blur'));
    for (const l of layers) {
      const cs = getComputedStyle(l);
      lines.push(`bf=${cs.backdropFilter} maskImage=${cs.maskImage.slice(0, 160)}`);
      lines.push(`   maskSize=${cs.maskSize} maskPos=${cs.maskPosition} maskRepeat=${cs.maskRepeat} maskMode=${cs.maskMode} maskComposite=${cs.maskComposite} op=${cs.opacity}`);
      lines.push(`   style="${l.getAttribute('style')}"`);
    }
    return lines;
  }, sel);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
