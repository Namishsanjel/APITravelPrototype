// Computed style of the story paragraph h4, ref vs port.
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2);
const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const h = [...document.querySelectorAll('h4, p, div')].find(
      (e) => e.children.length === 0 && (e.textContent || '').startsWith('API Touch began with a handful')
    );
    if (!h) return 'NOT FOUND';
    const cs = getComputedStyle(h);
    const props = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'wordSpacing', 'lineHeight', 'fontKerning', 'fontFeatureSettings', 'fontVariationSettings', 'textRendering', 'fontStretch', 'textTransform', 'fontOpticalSizing', 'color', 'textAlign', 'textWrap'];
    const out = {};
    for (const p of props) out[p] = cs[p];
    // measure a test string width with this element's style
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;white-space:pre;visibility:hidden;';
    for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'wordSpacing', 'fontKerning', 'fontFeatureSettings', 'fontVariationSettings', 'textRendering']) span.style[p] = cs[p];
    span.textContent = 'same. So we built something smaller \u2014 routes chosen';
    document.body.appendChild(span);
    out.measure = +span.getBoundingClientRect().width.toFixed(2);
    span.textContent = 'API Touch began with a handful of weekend hikes among';
    out.measureL1 = +span.getBoundingClientRect().width.toFixed(2);
    span.remove();
    out.rect = JSON.stringify(h.getBoundingClientRect());
    return out;
  });
};
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const a = await PROBE(page, A);
  const b = await PROBE(page, B);
  console.log('A=' + A);
  console.log(JSON.stringify(a, null, 1));
  console.log('B=' + B);
  console.log(JSON.stringify(b, null, 1));
  await browser.close();
})();
