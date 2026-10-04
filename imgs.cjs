// All <img> on a page: node imgs.cjs <url> [width]
const { chromium } = require('playwright');
const [url, vw = '390'] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(vw), height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 60); else { window.scrollTo(0, 0); setTimeout(res, 400); } };
      s();
    });
  });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => [...document.querySelectorAll('img')].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      nat: `${el.naturalWidth}x${el.naturalHeight}`,
      disp: `${r.width.toFixed(0)}x${r.height.toFixed(0)} @${r.x.toFixed(0)},${(r.y + scrollY).toFixed(0)}`,
      cur: (el.currentSrc || '').replace(/^https:\/\/framerusercontent\.com\/images\//, '').slice(0, 60),
      ss: (el.getAttribute('srcset') || '').split(',').length + ' cand',
      alt: (el.alt || '').slice(0, 24),
    };
  }));
  out.forEach((o) => console.log(`${o.nat.padEnd(11)} ${o.disp.padEnd(22)} ${o.ss.padEnd(7)} ${o.cur}  |${o.alt}`));
  await browser.close();
})();
