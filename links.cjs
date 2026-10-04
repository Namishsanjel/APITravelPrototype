// Dump every anchor href with its text.
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => { let y = 0; const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else res(); }; s(); });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2000);
  const links = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => {
    const r = a.getBoundingClientRect();
    return { t: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44), href: a.getAttribute('href'), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
  }).filter((l) => l.w > 4 && l.h > 4));
  console.log(JSON.stringify(links, null, 0).replace(/},/g, '},\n'));
  await browser.close();
})();
