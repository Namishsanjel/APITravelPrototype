// Detail energy + mad vs target for a list of equally-sized PNGs.
// Usage: node energies.cjs <target.png> <img1.png> [img2.png ...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [target, ...files] = process.argv.slice(2);
const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = await page.evaluate(
    async ({ tu, fus, names }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const T = await load(tu);
      const W = T.width, H = T.height;
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, W, H).data;
      };
      const gray = (d) => {
        const g = new Float64Array(W * H);
        for (let i = 0, p = 0; i < d.length; i += 4, p++) g[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        return g;
      };
      const lap = (g) => {
        let s = 0, n = 0;
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          s += Math.abs(4 * g[i] - g[i - 1] - g[i + 1] - g[i - W] - g[i + W]); n++;
        }
        return s / n;
      };
      const Td = grab(T);
      const out = [['TARGET ' + names[0], lap(gray(Td)).toFixed(3), '-']];
      for (let k = 0; k < fus.length; k++) {
        const V = await load(fus[k]);
        if (V.width !== W || V.height !== H) { out.push([names[k + 1], `SIZE ${V.width}x${V.height}!`, '-']); continue; }
        const Vd = grab(V);
        let sum = 0;
        for (let i = 0; i < Vd.length; i += 4) {
          sum += Math.abs(Vd[i] - Td[i]) + Math.abs(Vd[i + 1] - Td[i + 1]) + Math.abs(Vd[i + 2] - Td[i + 2]);
        }
        out.push([names[k + 1], lap(gray(Vd)).toFixed(3), (sum / (W * H * 3)).toFixed(3)]);
      }
      return out;
    },
    { tu: toUrl(target), fus: files.map(toUrl), names: [target, ...files] }
  );
  console.log('file                                       detail   mad-vs-target');
  res.forEach(([n, d, m]) => console.log(`${n.padEnd(40)} ${String(d).padStart(6)}  ${String(m).padStart(8)}`));
  await browser.close();
})();
