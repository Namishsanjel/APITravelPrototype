// Background/image elements: node bg.cjs <url> <needle> [width]
const { chromium } = require('playwright');
const [url, needle, vw = '390'] = process.argv.slice(2);

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
  await page.waitForTimeout(1500);
  const out = await page.evaluate((needle) => {
    const res = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundImage;
      const isImg = el.tagName === 'IMG';
      const src = isImg ? el.currentSrc || '' : '';
      const hay = (bg || '') + ' ' + src + ' ' + (el.getAttribute('alt') || '');
      if (!hay.toLowerCase().includes(needle.toLowerCase())) continue;
      const r = el.getBoundingClientRect();
      res.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 45),
        src: (src || bg),
        srcset: isImg ? (el.getAttribute('srcset') || '') : '',
        sizes: isImg ? (el.getAttribute('sizes') || '') : '',
        pos: cs.backgroundPosition, size: cs.backgroundSize, rep: cs.backgroundRepeat,
        fit: cs.objectFit, pos2: cs.objectPosition,
        nat: isImg ? `${el.naturalWidth}x${el.naturalHeight}` : '',
        box: `x${r.x.toFixed(1)} y${(r.y + scrollY).toFixed(1)} w${r.width.toFixed(1)} h${r.height.toFixed(1)}`,
        filt: cs.filter, op: cs.opacity, mask: (cs.maskImage || '').slice(0, 40),
      });
    }
    return res.slice(0, 8);
  }, needle);
  out.forEach((r) => console.log(JSON.stringify(r)));
  await browser.close();
})();
