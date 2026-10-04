// Screenshot the original card in three capture modes: element, viewport, fullpage-crop.
// Usage: node cardshots.cjs <url>
const { chromium } = require('playwright');
const fs = require('fs');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const card = await page.$('.framer-DjlwF');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);

  // 1. element screenshot
  const elBuf = await card.screenshot({ type: 'png' });
  fs.writeFileSync('shots/card-element.png', elBuf);

  // 2. viewport screenshot of the card's position
  const box = await card.boundingBox();
  const vpBuf = await page.screenshot({
    type: 'png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height },
  });
  fs.writeFileSync('shots/card-viewport.png', vpBuf);

  // 3. fullpage screenshot cropped
  const fpBuf = await page.screenshot({ type: 'png', fullPage: true });
  fs.writeFileSync('shots/card-fullpage-raw.png', fpBuf);

  // 4. img info
  const info = await page.evaluate(() => {
    const img = document.querySelector('.framer-DjlwF img');
    if (!img) return { err: 'no img' };
    const cs = getComputedStyle(img);
    const parents = [];
    let p = img.parentElement;
    for (let i = 0; p && i < 4; i++, p = p.parentElement) {
      const s = getComputedStyle(p);
      parents.push(`${p.tagName} filter=${s.filter} bf=${s.backdropFilter} wc=${s.willChange} blend=${s.mixBlendMode} iso=${s.isolation} tf=${s.transform === 'none' ? '-' : s.transform.slice(0, 30)}`);
    }
    return {
      src: img.currentSrc.slice(0, 120),
      srcset: (img.getAttribute('srcset') || '').slice(0, 200),
      nw: img.naturalWidth, nh: img.naturalHeight,
      filter: cs.filter, bf: cs.backdropFilter, wc: cs.willChange,
      style: img.getAttribute('style') ? img.getAttribute('style').slice(0, 300) : '',
      parents,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
