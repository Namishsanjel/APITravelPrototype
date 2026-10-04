// Mean/max luminance + mad between two PNGs over a region.
// Usage: node logocheck.cjs <a.png> <b.png> <x> <y> <w> <h>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [a, b, X, Y, W, H] = [process.argv[2], process.argv[3], ...process.argv.slice(4).map(Number)];
const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = await page.evaluate(
    async ({ ua, ub, X, Y, W, H }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, X, Y, W, H, 0, 0, W, H);
        return x.getImageData(0, 0, W, H).data;
      };
      const stats = (d) => {
        let sum = 0, max = 0, n = 0, bright = 0;
        for (let i = 0; i < d.length; i += 4) {
          const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          sum += l; n++;
          if (l > max) max = l;
          if (l > 200) bright++;
        }
        return { mean: (sum / n).toFixed(1), max: max.toFixed(1), brightPct: ((bright / n) * 100).toFixed(1) };
      };
      const Da = grab(A), Db = grab(B);
      let mad = 0;
      for (let i = 0; i < Da.length; i += 4) {
        mad += Math.abs(Da[i] - Db[i]) + Math.abs(Da[i + 1] - Db[i + 1]) + Math.abs(Da[i + 2] - Db[i + 2]);
      }
      return { a: stats(Da), b: stats(Db), mad: (mad / (W * H * 3)).toFixed(2) };
    },
    { ua: toUrl(a), ub: toUrl(b), X, Y, W, H }
  );
  console.log(`A: mean=${res.a.mean} max=${res.a.max} bright%=${res.a.brightPct}`);
  console.log(`B: mean=${res.b.mean} max=${res.b.max} bright%=${res.b.brightPct}`);
  console.log(`mad: ${res.mad}`);
  await browser.close();
})();
