// Print document.body.innerText line by line for a URL.
// Usage: node inner.cjs <url> [filter]
const { chromium } = require('playwright');
const url = process.argv[2];
const filter = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else { window.scrollTo(0, 0); setTimeout(res, 300); } };
      s();
    });
  });
  await page.waitForTimeout(2500);
  const text = await page.evaluate(() => document.body.innerText || '');
  text.split('\n').map((l) => l.trim()).filter(Boolean).forEach((l, i) => {
    if (!filter || l.toLowerCase().includes(filter.toLowerCase())) console.log(`${String(i).padStart(3)}: ${l}`);
  });
  await browser.close();
})();
