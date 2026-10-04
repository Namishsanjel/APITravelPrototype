// 2D cell diff map between two PNGs over a region.
// Usage: node cellmap.cjs <a.png> <b.png> <x> <y> <w> <h> [cell]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const a = path.resolve(process.argv[2]);
const b = path.resolve(process.argv[3]);
const [X, Y, W, H] = process.argv.slice(4, 8).map(Number);
const CELL = Number(process.argv[8] || 60);
const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = await page.evaluate(
    async ({ ua, ub, X, Y, W, H, CELL }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, img.width, img.height).data;
      };
      const da = grab(A), db = grab(B);
      const rows = [];
      for (let cy = Y; cy < Y + H; cy += CELL) {
        const row = [];
        for (let cx = X; cx < X + W; cx += CELL) {
          let sum = 0, n = 0;
          for (let y = cy; y < Math.min(cy + CELL, Y + H); y += 2) {
            for (let x = cx; x < Math.min(cx + CELL, X + W); x += 2) {
              const i = (y * A.width + x) * 4;
              const j = (y * B.width + x) * 4;
              sum += (Math.abs(da[i] - db[j]) + Math.abs(da[i + 1] - db[j + 1]) + Math.abs(da[i + 2] - db[j + 2])) / 3;
              n++;
            }
          }
          row.push(String(Math.round(sum / n)).padStart(4));
        }
        rows.push(`y${String(cy).padStart(4)}: ${row.join(' ')}`);
      }
      return rows;
    },
    { ua: toUrl(a), ub: toUrl(b), X, Y, W, H, CELL }
  );
  console.log(out.join('\n'));
  await browser.close();
})();
