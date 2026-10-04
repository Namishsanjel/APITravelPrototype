// Full-page screenshot that first walks the page slowly so Framer's
// scroll-triggered appear animations finish, then waits for settle.
// Usage: node refshot.cjs <name> <url> <desktop|mobile>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const [name, url, kind] = process.argv.slice(2);
const isMobile = kind === 'mobile';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (e) {
    console.log('goto warn:', e.message);
  }
  await page.waitForTimeout(2500);
  // slow scroll: dwell 220ms per 500px step so every appear animation starts
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += 500;
        if (y < document.body.scrollHeight) setTimeout(step, 220);
        else { window.scrollTo(0, 0); setTimeout(res, 500); }
      };
      step();
    });
  });
  await page.waitForTimeout(3500);
  // make sure every image decoded before capturing (CDN hiccups)
  for (let attempt = 0; attempt < 3; attempt++) {
    const bad = await page.evaluate(async () => {
      const imgs = [...document.images];
      const t0 = Date.now();
      while (Date.now() - t0 < 8000) {
        const pending = imgs.filter((i) => !i.complete || i.naturalWidth === 0);
        if (!pending.length) break;
        await new Promise((r) => setTimeout(r, 250));
      }
      return imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
    });
    if (!bad.length) break;
    console.log(`${name}: attempt ${attempt + 1}: ${bad.length} image(s) unloaded, cache-busting:`, bad.slice(0, 4));
    await page.evaluate((urls) => {
      for (const img of document.images) {
        const u = img.currentSrc || img.src;
        if (urls.includes(u)) img.src = u + (u.includes('?') ? '&' : '?') + 'r=' + Date.now();
      }
    }, bad);
    await page.waitForTimeout(4000);
  }
  const file = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  const h = await page.evaluate(() => document.body.scrollHeight);
  console.log(`OK ${name} ${url} [${kind}] ${h}px -> ${file}`);
  await browser.close();
})();
