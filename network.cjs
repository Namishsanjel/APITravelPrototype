const { chromium } = require('playwright');
const url = process.argv[2];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failed = [];
  const loaded = new Map();
  page.on('response', (r) => {
    const u = r.url();
    if (u.includes('picsum') || u.includes('framerusercontent.com/images')) {
      loaded.set(u, r.status());
    }
  });
  page.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + (r.failure() || {}).errorText));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.log('goto', e.message));
  await page.evaluate(async () => {
    await new Promise((res) => { let y = 0; const s = () => { window.scrollTo(0, y); y += 700; if (y < document.body.scrollHeight) setTimeout(s, 50); else res(); }; s(); });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(4000);
  console.log('=== IMAGE RESPONSES ===');
  for (const [u, s] of loaded) console.log(s, u.slice(0, 130));
  console.log('=== FAILED ===');
  failed.forEach((f) => console.log(f.slice(0, 130)));
  // also collect every img src in DOM after load
  const srcs = await page.evaluate(() => [...document.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight })).slice(0, 60));
  console.log('=== DOM IMGs ===');
  srcs.forEach((s) => console.log(s.w + 'x' + s.h, s.src.slice(0, 130)));
  await browser.close();
})();
