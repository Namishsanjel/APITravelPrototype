// Font-smoothing related computed styles on html/body + a text element.
// Usage: node smoothprobe.cjs <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const out = await page.evaluate(() => {
    const pick = (el, name) => {
      const cs = getComputedStyle(el);
      return `${name}: smoothing=${cs.webkitFontSmoothing} rendering=${cs.textRendering} optimizeLegibility=${cs.textOptimizeLegibility} geometric=${cs.textGeometricPrecision}`;
    };
    const p = document.querySelector('p');
    return [
      pick(document.documentElement, 'html'),
      pick(document.body, 'body'),
      p ? pick(p, 'p') : 'no p',
      // stylesheet rules mentioning font-smoothing
      ...[...document.styleSheets].flatMap((s) => {
        try {
          return [...s.cssRules]
            .filter((r) => r.cssText && r.cssText.includes('font-smoothing'))
            .map((r) => `rule: ${r.cssText.slice(0, 200)}`);
        } catch (e) {
          return [];
        }
      }),
    ];
  });
  out.forEach((l) => console.log(l));
  await browser.close();
})();
