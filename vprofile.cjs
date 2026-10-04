// Vertical pixel profile of a column (or row) from a PNG.
// Usage: node vprofile.cjs <img.png> <x> <y0> <y1> <step>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [file, X, Y0, Y1, STEP] = [process.argv[2], ...process.argv.slice(3).map(Number)];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const dataUrl = 'data:image/png;base64,' + fs.readFileSync(path.resolve(file)).toString('base64');
  const out = await page.evaluate(
    async ({ dataUrl, X, Y0, Y1, STEP }) => {
      const img = new Image();
      await new Promise((r) => { img.onload = r; img.src = dataUrl; });
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const lines = [];
      for (let y = Y0; y <= Y1; y += STEP) {
        const d = ctx.getImageData(X, y, 1, 1).data;
        lines.push(`y${y}: ${d[0]},${d[1]},${d[2]}`);
      }
      return lines;
    },
    { dataUrl, X, Y0, Y1, STEP }
  );
  out.forEach((l) => console.log(l));
  await browser.close();
})();
