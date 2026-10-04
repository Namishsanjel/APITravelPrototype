// One-off: transforms of about polaroids + nav hrefs + guide/experience details.
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
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const res = { polaroids: [], nav: [], expImgs: [], cardImgs: [] };
    // polaroid images in About card
    const card = [...document.querySelectorAll('[data-framer-name="Bottom card"], [data-framer-name="Bottom Card"]')][0];
    if (card) {
      for (const el of card.querySelectorAll('[data-framer-name^="Image"]')) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        res.polaroids.push({ n: el.getAttribute('data-framer-name'), transform: cs.transform, rad: cs.borderRadius, x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) });
      }
    }
    for (const a of document.querySelectorAll('header a')) {
      res.nav.push({ t: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30), href: a.getAttribute('href') });
    }
    // object-fit / object-position of a few images
    for (const img of document.querySelectorAll('img')) {
      const cs = getComputedStyle(img);
      const r = img.getBoundingClientRect();
      if (r.height < 60) continue;
      res.cardImgs.push({ src: (img.currentSrc || img.src).slice(-40), fit: cs.objectFit, pos: cs.objectPosition, w: Math.round(r.width), h: Math.round(r.height), parentRad: getComputedStyle(img.parentElement).borderRadius });
    }
    return res;
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
