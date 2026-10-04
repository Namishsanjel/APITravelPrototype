// Load the port and print console messages + #root html length.
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 300)));
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 500)));
  page.on('requestfailed', (r) => console.log('[reqfail]', r.url().slice(0, 160), r.failure()?.errorText));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 }).catch((e) => console.log('goto', e.message));
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => ({
    rootLen: (document.getElementById('root') || document.body).innerHTML.length,
    bodyH: document.body.scrollHeight,
    h1: document.querySelector('h1') ? document.querySelector('h1').textContent : null,
    title: document.title,
  }));
  console.log(JSON.stringify(info));
  await browser.close();
})();
