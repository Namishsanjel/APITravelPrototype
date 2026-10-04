// Per-row mean diff over a region: node rows.cjs <a.png> <b.png> <x> <y> <w> <h> [step]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [a, b, X, Y, W, H] = process.argv.slice(2, 8).map((v, i) => (i > 1 ? Number(v) : v));
const STEP = Number(process.argv[8] || 1);

const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = await page.evaluate(
    async ({ ua, ub, X, Y, W, H, STEP }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const draw = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, img.width, img.height).data;
      };
      const da = draw(A), db = draw(B);
      const rows = [];
      for (let y = Y; y < Y + H; y += STEP) {
        let s = 0;
        for (let x = X; x < X + W; x++) {
          const i = (y * A.width + x) * 4;
          s += (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) / 3;
        }
        rows.push(`${y}:${(s / W).toFixed(2)}`);
      }
      // columns
      const cols = [];
      for (let x = X; x < X + W; x++) {
        let s = 0;
        for (let y = Y; y < Y + H; y++) {
          const i = (y * A.width + x) * 4;
          s += (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) / 3;
        }
        cols.push(`${x}:${(s / H).toFixed(2)}`);
      }
      return { rows, cols };
    },
    { ua: toUrl(a), ub: toUrl(b), X, Y, W, H, STEP }
  );
  console.log('rows:', out.rows.join(' '));
  console.log('cols:', out.cols.join(' '));
  await browser.close();
})();
