// Load a page and print console messages + page errors.
// Usage: node console.cjs <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') console.log(`[${m.type()}] ${m.text().slice(0, 400)}`);
  });
  page.on('pageerror', (e) => console.log(`[pageerror] ${String(e).slice(0, 600)}`));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.log('goto: ' + e.message));
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => ({
    bodyH: document.body.scrollHeight,
    rootChildren: document.getElementById('root') ? document.getElementById('root').children.length : -1,
    text: document.body.innerText.slice(0, 200),
  }));
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
