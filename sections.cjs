const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const outDir = process.argv[3];
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.evaluate(async () => {
    await new Promise((res) => { let y = 0; const s = () => { window.scrollTo(0, y); y += 700; if (y < document.body.scrollHeight) setTimeout(s, 60); else res(); }; s(); });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(3000);

  // collect sections + their image srcs (hydrated)
  const data = await page.evaluate(() => {
    const secs = [...document.querySelectorAll('section, footer, header')].filter((el) => el.getAttribute('data-framer-name'));
    return secs.map((el, i) => {
      const r = el.getBoundingClientRect();
      const imgs = [...el.querySelectorAll('img')].map((im) => ({
        src: im.currentSrc || im.src,
        w: im.naturalWidth,
        h: im.naturalHeight,
        alt: (im.alt || '').slice(0, 60),
      })).filter((x) => x.w > 0);
      return {
        i,
        name: (el.getAttribute('data-framer-name') || '').trim(),
        tag: el.tagName.toLowerCase(),
        y: Math.round(r.y + window.scrollY),
        h: Math.round(r.height),
        imgs,
      };
    });
  });
  fs.writeFileSync(path.join(outDir, 'sections.json'), JSON.stringify(data, null, 1));

  // clip screenshots per section
  for (const s of data) {
    if (s.h <= 0) continue;
    try {
      await page.screenshot({
        path: path.join(outDir, `sec-${s.i}-${s.name.replace(/[^a-z0-9]+/gi, '_')}.png`),
        clip: { x: 0, y: s.y, width: 1440, height: Math.min(s.h, 3000) },
        fullPage: true,
      });
      console.log('shot', s.i, s.name, s.y, s.h, 'imgs', s.imgs.length);
    } catch (e) { console.log('fail', s.name, e.message); }
  }
  await browser.close();
})();
