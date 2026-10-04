// Best-fit shift probe: node shift.cjs <a.png> <b.png> <x> <y> <w> <h> [maxShift]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [a, b, X, Y, W, H] = process.argv.slice(2, 8).map((v, i) => (i > 1 ? Number(v) : v));
const MAX = Number(process.argv[8] || 4);

const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = await page.evaluate(
    async ({ ua, ub, X, Y, W, H, MAX }) => {
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
      const rowMean = (d, row) => {
        let s = 0;
        for (let x = X; x < X + W; x++) {
          const i = (row * A.width + x) * 4;
          s += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
        }
        return s / (W * 3);
      };
      const mean = (dx, dy) => {
        let s = 0, n = 0;
        for (let y = Y; y < Y + H; y++) {
          for (let x = X; x < X + W; x++) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= A.width || yy >= A.height) continue;
            const i = (y * A.width + x) * 4, j = (yy * A.width + xx) * 4;
            s += Math.abs(da[i] - db[j]) + Math.abs(da[i + 1] - db[j + 1]) + Math.abs(da[i + 2] - db[j + 2]);
            n++;
          }
        }
        return s / (n * 3);
      };
      const shifts = [];
      for (let dy = -MAX; dy <= MAX; dy++) for (let dx = -MAX; dx <= MAX; dx++) shifts.push({ dx, dy, m: mean(dx, dy) });
      shifts.sort((p, q) => p.m - q.m);
      const rows = [];
      for (let y = Y; y < Y + H; y += 2) rows.push(`${y}:${rowMean(da, y).toFixed(1)}`);
      // luminance profile of a mid row in both
      const prof = (d, row) => {
        let s = '';
        for (let x = X; x < X + W; x += 4) {
          const i = (row * A.width + x) * 4;
          s += String.fromCharCode(33 + Math.round(((d[i] + d[i + 1] + d[i + 2]) / 3 / 255) * 80));
        }
        return s;
      };
      return {
        top: shifts.slice(0, 6).map((s) => `dx${s.dx} dy${s.dy}=${s.m.toFixed(2)}`),
        rows,
        a: prof(da, Y + Math.floor(H / 2)),
        b: prof(db, Y + Math.floor(H / 2)),
      };
    },
    { ua: toUrl(a), ub: toUrl(b), X, Y, W, H, MAX }
  );
  console.log('best shifts:', out.top.join('  '));
  console.log('row means:', out.rows.join(' '));
  console.log('A:', out.a);
  console.log('B:', out.b);
  await browser.close();
})();
