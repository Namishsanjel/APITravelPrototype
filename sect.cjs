// Element screenshots of the reworked home sections (desktop + mobile).
const { chromium } = require('playwright');
const path = require('path');

const URL = process.argv[2] || 'http://localhost:5174/';
const SHOTS = path.join(__dirname, 'shots');

const TARGETS = [
  ['sec-header', 'header'],
  ['sec-hero', 'section'],
  ['sec-tours', 'section#hikes'],
  ['sec-destinations', 'section#destinations'],
  ['sec-services', 'section#services'],
  ['sec-guide', 'section:has-text("Who are we")'],
  ['sec-about', 'section#about'],
  ['sec-footer', 'footer'],
];

(async () => {
  const browser = await chromium.launch();
  for (const [kind, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    // walk the page so lazy images decode
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    for (const [name, sel] of TARGETS) {
      const el = page.locator(sel).first();
      try {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await el.screenshot({ path: path.join(SHOTS, `${name}-${kind}.png`) });
        console.log('OK', `${name}-${kind}`);
      } catch (e) {
        console.log('FAIL', name, kind, e.message.split('\n')[0]);
      }
    }
    await ctx.close();
  }
  await browser.close();
})();
