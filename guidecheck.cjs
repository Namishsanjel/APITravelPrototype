// Measure the guide photo card + inspect the source PNG.
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(process.argv[2] || 'http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const out = await page.evaluate(() => {
    const img = document.querySelector('img[alt^="API Touch travel guide"]');
    if (!img) return 'guide img not found';
    const p = img.parentElement;
    const cs = getComputedStyle(img);
    const r = img.getBoundingClientRect();
    const pr = p.getBoundingClientRect();
    return {
      natural: [img.naturalWidth, img.naturalHeight],
      complete: img.complete,
      imgBox: [Math.round(r.width), Math.round(r.height)],
      parentBox: [Math.round(pr.width), Math.round(pr.height)],
      parentClass: p.className,
      position: cs.position,
      objectFit: cs.objectFit,
      w: cs.width,
      h: cs.height,
      src: img.currentSrc,
    };
  });
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
