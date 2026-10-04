// Row darkness profile: per row-band, mean luminance + dark pixel count.
// Usage: node rowprof.cjs <img.png> [y0 y1 step]
const { chromium } = require('playwright');
const fs = require('fs');
const [F, Y0, Y1, STEP] = process.argv.slice(2);
const y0 = +(Y0 || 0), y1 = +(Y1 || 1200), step = +(STEP || 25);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const buf = fs.readFileSync(F).toString('base64');
  const res = await page.evaluate(
    async ({ buf, y0, y1, step }) => {
      const img = await new Promise((r) => {
        const i = new Image();
        i.onload = () => r(i);
        i.src = 'data:image/png;base64,' + buf;
      });
      const W = img.width;
      const c = document.createElement('canvas');
      c.width = W;
      const rows = [];
      for (let y = y0; y < Math.min(y1, img.height); y += step) {
        const x = c.getContext('2d', { willReadFrequently: true });
        x.clearRect(0, 0, W, 1);
        x.drawImage(img, 0, y, W, step, 0, 0, W, step);
        const d = x.getImageData(0, 0, W, step).data;
        let lum = 0, dark = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) {
          const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          lum += l;
          if (l < 110) dark++;
          n++;
        }
        rows.push(`y${y}: mean=${(lum / n).toFixed(0)} dark=${((dark / n) * 100).toFixed(1)}%`);
      }
      return rows;
    },
    { buf, y0, y1, step }
  );
  console.log(F);
  res.forEach((r) => console.log('  ' + r));
  await browser.close();
})();
