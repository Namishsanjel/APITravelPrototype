// Band-by-band pixel diff between two PNGs (mean abs difference per 100px band).
// Usage: node band.cjs <original.png> <port.png> [bands]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const a = path.resolve(process.argv[2]);
const b = path.resolve(process.argv[3]);
const BAND = Number(process.argv[4] || 100);

const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = await page.evaluate(
    async ({ ua, ub, BAND }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const W = Math.min(A.width, B.width);
      const H = Math.min(A.height, B.height);
      const draw = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, img.width, img.height).data;
      };
      const da = draw(A), db = draw(B);
      const bands = [];
      for (let y0 = 0; y0 < H; y0 += BAND) {
        const y1 = Math.min(y0 + BAND, H);
        let sum = 0, n = 0, big = 0;
        for (let y = y0; y < y1; y++) {
          for (let x = 0; x < W; x++) {
            const i = (y * A.width + x) * 4;
            const j = (y * B.width + x) * 4;
            const d = (Math.abs(da[i] - db[j]) + Math.abs(da[i + 1] - db[j + 1]) + Math.abs(da[i + 2] - db[j + 2])) / 3;
            sum += d; n++;
            if (d > 40) big++;
          }
        }
        bands.push({ y0, y1, mad: +(sum / n).toFixed(2), pctBig: +((big / n) * 100).toFixed(1) });
      }
      return { sizeA: `${A.width}x${A.height}`, sizeB: `${B.width}x${B.height}`, W, H, bands };
    },
    { ua: toUrl(a), ub: toUrl(b), BAND }
  );

  console.log(`original ${res.sizeA} | port ${res.sizeB}`);
  const overall = res.bands.reduce((s, b) => s + b.mad, 0) / res.bands.length;
  console.log(`mean abs diff overall: ${overall.toFixed(2)} / 255`);
  console.log('\nworst 25 bands:');
  [...res.bands].sort((x, y) => y.mad - x.mad).slice(0, 25).forEach((b) => {
    console.log(`  y${b.y0}-${b.y1}: mad=${b.mad}  >40:${b.pctBig}%`);
  });
  console.log('\nall bands:');
  res.bands.forEach((b) => console.log(`  y${b.y0}-${b.y1}: mad=${b.mad} big=${b.pctBig}%`));
  await browser.close();
})();
