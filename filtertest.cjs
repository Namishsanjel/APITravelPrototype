// Click a filter pill and report how many cards remain visible.
// Usage: node filtertest.cjs <url> <pillText>
const { chromium } = require('playwright');
const url = process.argv[2];
const pill = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const count = () => page.evaluate(() =>
    [...document.querySelectorAll('[data-framer-name="Desktop"]')]
      .filter((e) => e.querySelector('[data-framer-name="Image wrap"]'))
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 100 && r.height > 100; }).length
  );

  const pillStyles = () => page.evaluate(() =>
    [...document.querySelectorAll('[data-framer-name="Tabs wrap"] [data-framer-name="Desktop"]')]
      .map((e) => `${(e.textContent || '').trim()}: ${getComputedStyle(e).backgroundColor}`)
  );
  console.log('cards before:', await count());
  console.log('pills before:', (await pillStyles()).join(' | '));
  const target = await page.$(`text="${pill}"`);
  if (!target) { console.log('pill not found:', pill); await browser.close(); return; }
  await target.click();
  await page.waitForTimeout(1200);
  console.log(`cards after clicking "${pill}":`, await count());
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll('[data-framer-name="Desktop"]')]
      .filter((e) => e.querySelector('[data-framer-name="Image wrap"]'))
      .map((e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}`; })
  );
  console.log(boxes.join('\n'));
  await browser.close();
})();
