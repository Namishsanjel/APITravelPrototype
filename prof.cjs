// Luminance profile of one row from two PNGs: node prof.cjs <a.png> <b.png> <x> <y> <w> [step]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [a, b, X, Y, W] = process.argv.slice(2, 7).map((v, i) => (i > 1 ? Number(v) : v));
const STEP = Number(process.argv[7] || 1);

const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = await page.evaluate(
    async ({ ua, ub, X, Y, W, STEP }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0);
        return g.getImageData(0, 0, img.width, img.height).data;
      };
      const da = grab(A), db = grab(B);
      const at = (d, x, y) => { const i = (y * A.width + x) * 4; return (d[i] + d[i + 1] + d[i + 2]) / 3; };
      const ramp = (v) => String.fromCharCode(33 + Math.round((v / 255) * 80));
      let pa = '', pb = '', dif = '';
      for (let x = X; x < X + W; x += STEP) {
        pa += ramp(at(da, x, Y));
        pb += ramp(at(db, x, Y));
        dif += String(Math.min(9, Math.round(Math.abs(at(da, x, Y) - at(db, x, Y)) / 12)));
      }
      return { pa, pb, dif };
    },
    { ua: toUrl(a), ub: toUrl(b), X, Y, W, STEP }
  );
  console.log('x   ', String(X).padEnd(out.pa.length, ' '));
  console.log('ref ', out.pa);
  console.log('port', out.pb);
  console.log('diff', out.dif);
  await browser.close();
})();
