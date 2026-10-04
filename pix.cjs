// Print RGBA at coordinates from a PNG (via chromium canvas).
const { chromium } = require('playwright');
const path = require('path');

const file = path.resolve(process.argv[2]);
const pts = process.argv.slice(3);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const dataUrl = 'data:image/png;base64,' + require('fs').readFileSync(file).toString('base64');
  const res = await page.evaluate(
    async ({ dataUrl, pts }) => {
      const img = new Image();
      await new Promise((r) => { img.onload = r; img.src = dataUrl; });
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const out = [];
      for (const p of pts) {
        const [x, y] = p.split(',').map(Number);
        const d = ctx.getImageData(x, y, 1, 1).data;
        out.push(`${p} => rgba(${d[0]},${d[1]},${d[2]},${d[3]})`);
      }
      return { size: img.width + 'x' + img.height, out };
    },
    { dataUrl, pts }
  );
  console.log('image', res.size);
  res.out.forEach((l) => console.log(l));
  await browser.close();
})();
