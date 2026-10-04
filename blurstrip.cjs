// Render a sharp PNG's region blurred at several sigmas into one strip image.
// Usage: node blurstrip.cjs <sharp.png> <x> <y> <w> <h> <out.png> <s1> <s2> ...
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [src, out, X, Y, W, H] = [process.argv[2], process.argv[3], ...process.argv.slice(4, 8).map(Number)];
const sigmas = process.argv.slice(8).map(Number);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const dataUrl = 'data:image/png;base64,' + fs.readFileSync(path.resolve(src)).toString('base64');
  const res = await page.evaluate(
    async ({ dataUrl, X, Y, W, H, sigmas }) => {
      const img = new Image();
      await new Promise((r) => { img.onload = r; img.src = dataUrl; });
      const PAD = 60;
      const strip = document.createElement('canvas');
      const ctx = strip.getContext('2d');
      strip.width = W;
      strip.height = (H + 10) * sigmas.length + 10;
      ctx.fillStyle = '#f00';
      let y = 0;
      for (const s of sigmas) {
        const c = document.createElement('canvas');
        c.width = W + PAD * 2; c.height = H + PAD * 2;
        const x = c.getContext('2d');
        x.filter = `blur(${s}px)`;
        x.drawImage(img, X - PAD, Y - PAD, W + PAD * 2, H + PAD * 2, 0, 0, W + PAD * 2, H + PAD * 2);
        ctx.drawImage(c, PAD, PAD, W, H, 0, y, W, H);
        y += H + 10;
      }
      return strip.toDataURL('image/png');
    },
    { dataUrl, X, Y, W, H, sigmas }
  );
  fs.writeFileSync(path.resolve(out), Buffer.from(res.split(',')[1], 'base64'));
  console.log('wrote', out, 'sigmas:', sigmas.join(', '));
  await browser.close();
})();
