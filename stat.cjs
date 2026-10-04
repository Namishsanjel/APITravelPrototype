// Region stats for two PNGs: node stat.cjs <a.png> <b.png> x y w h
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [a, b, x, y, w, h] = process.argv.slice(2);
const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = await page.evaluate(
    async ({ ua, ub, x, y, w, h }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(x, y, w, h).data;
      };
      const da = grab(A), db = grab(B);
      const stats = (d) => {
        let n = 0, sr = 0, sg = 0, sb = 0, min = 255, max = 0;
        const hist = {};
        for (let i = 0; i < d.length; i += 4) {
          const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
          sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++;
          min = Math.min(min, l); max = Math.max(max, l);
          const bucket = Math.round(l / 16) * 16;
          hist[bucket] = (hist[bucket] || 0) + 1;
        }
        const top = Object.entries(hist).sort((p, q) => q[1] - p[1]).slice(0, 5).map(([k, v]) => `${k}:${v}`);
        return `rgb(${(sr / n).toFixed(1)},${(sg / n).toFixed(1)},${(sb / n).toFixed(1)}) min=${min.toFixed(0)} max=${max.toFixed(0)} hist=${top.join(' ')}`;
      };
      return { A: stats(da), B: stats(db) };
    },
    { ua: toUrl(a), ub: toUrl(b), x: Number(x), y: Number(y), w: Number(w), h: Number(h) }
  );
  console.log('A(ref): ' + res.A);
  console.log('B(port): ' + res.B);
  await browser.close();
})();
