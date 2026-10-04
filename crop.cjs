// Crop a region from a PNG: node crop.cjs <src.png> <out.png> <x> <y> <w> <h>
const { chromium } = require('playwright');
const fs = require('fs');
const [SRC, OUT, X, Y, W, H] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const b64 = fs.readFileSync(SRC).toString('base64');
  const out = await page.evaluate(async ({ b64, x, y, w, h }) => {
    const img = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b64; });
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    return c.toDataURL('image/png').split(',')[1];
  }, { b64, x: +X, y: +Y, w: +W, h: +H });
  fs.writeFileSync(OUT, Buffer.from(out, 'base64'));
  console.log('wrote', OUT);
  await browser.close();
})();
