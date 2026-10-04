// Print outerHTML of the first element matching a selector.
// Usage: node html.cjs <url> <selector>
const { chromium } = require('playwright');
const url = process.argv[2];
const sel = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const html = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return 'NOT FOUND: ' + sel;
    return el.outerHTML.replace(/></g, '>\n<');
  }, sel);
  console.log(html);
  await browser.close();
})();
