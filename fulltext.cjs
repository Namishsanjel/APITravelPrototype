// Full (untruncated) text of every significant text element + footer overlay gradient.
const { chromium } = require('playwright');
const fs = require('fs');

const url = process.argv[2];
const out = process.argv[3];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else res(); };
      s();
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => {
    const long = [];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,p,span,a,div,li')) {
      const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!direct) continue;
      const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
      if (t.length < 55) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 10) continue;
      const cs = getComputedStyle(el);
      long.push({
        tag: el.tagName.toLowerCase(),
        x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
        w: Math.round(r.width),
        color: cs.color, ta: cs.textAlign,
        t,
      });
    }
    // footer + hero overlays gradients
    const grads = [];
    for (const el of document.querySelectorAll('[data-framer-name="Overlay"]')) {
      const r = el.getBoundingClientRect();
      grads.push({ y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height), bg: getComputedStyle(el).backgroundImage });
    }
    // all imgs with sizes
    const imgs = [];
    for (const img of document.images) {
      const r = img.getBoundingClientRect();
      imgs.push({ src: img.currentSrc || img.src, x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height), alt: (img.alt || '').slice(0, 40) });
    }
    return { long, grads, imgs };
  });

  fs.writeFileSync(out, JSON.stringify(data, null, 1));
  console.log('long', data.long.length, 'grads', data.grads.length, 'imgs', data.imgs.length);
  await browser.close();
})();
