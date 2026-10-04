// Ink metrics for a region in two PNGs: node ink.cjs <a.png> <b.png> <x> <y> <w> <h> [thresh]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [a, b, X, Y, W, H] = process.argv.slice(2, 8).map((v, i) => (i > 1 ? Number(v) : v));
const TH = Number(process.argv[8] || 150);

const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = await page.evaluate(
    async ({ ua, ub, X, Y, W, H, TH }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0);
        return g.getImageData(0, 0, img.width, img.height).data;
      };
      const stats = (d) => {
        let ink = 0, sx = 0, sy = 0, minx = 1e9, maxx = -1, miny = 1e9, maxy = -1, sum = 0;
        const rowInk = [];
        for (let y = Y; y < Y + H; y++) {
          let ri = 0;
          for (let x = X; x < X + W; x++) {
            const i = (y * A.width + x) * 4;
            const v = (d[i] + d[i + 1] + d[i + 2]) / 3;
            sum += v;
            if (v < TH) {
              ink++; ri++; sx += x; sy += y;
              if (x < minx) minx = x; if (x > maxx) maxx = x;
              if (y < miny) miny = y; if (y > maxy) maxy = y;
            }
          }
          rowInk.push(ri);
        }
        return {
          ink, mean: +(sum / (W * H)).toFixed(2),
          cx: ink ? +(sx / ink).toFixed(2) : null, cy: ink ? +(sy / ink).toFixed(2) : null,
          bbox: ink ? `${minx},${miny}..${maxx},${maxy}` : 'none',
          rowInk,
        };
      };
      return { a: stats(grab(A)), b: stats(grab(B)) };
    },
    { ua: toUrl(a), ub: toUrl(b), X, Y, W, H, TH }
  );
  const f = (s) => `ink=${s.ink} mean=${s.mean} cx=${s.cx} cy=${s.cy} bbox=${s.bbox}`;
  console.log('ref ', f(out.a));
  console.log('port', f(out.b));
  console.log('ref  rows:', out.a.rowInk.join(','));
  console.log('port rows:', out.b.rowInk.join(','));
  await browser.close();
})();
