// Detail energy (mean |Laplacian|) for a region, plus a synthetic-blur sigma
// calibration curve computed from a known-sharp reference region.
// Usage: node hfm.cjs <sharp.png> <ref.png> <mine.png> <x> <y> <w> <h>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [sharpF, refF, mineF, X, Y, W, H] = [
  process.argv[2], process.argv[3], process.argv[4],
  ...process.argv.slice(5, 9).map(Number),
];
const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = await page.evaluate(
    async ({ ua, ub, uc, X, Y, W, H }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B, C] = await Promise.all([load(ua), load(ub), load(uc)]);
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, X, Y, W, H, 0, 0, W, H);
        return x.getImageData(0, 0, W, H).data;
      };
      const gray = (d) => {
        const g = new Float64Array(W * H);
        for (let i = 0, p = 0; i < d.length; i += 4, p++) g[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        return g;
      };
      const lap = (g) => {
        let s = 0, n = 0;
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const i = y * W + x;
            const v = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - W] - g[i + W];
            s += Math.abs(v); n++;
          }
        }
        return s / n;
      };
      const HF = { sharp: lap(gray(grab(A))), ref: lap(gray(grab(B))), mine: lap(gray(grab(C))) };
      // calibration: blur sharp by sigma, measure HF
      const PAD = 48;
      const calib = [];
      for (const s of [0, 0.5, 1, 1.44, 2, 2.5, 3, 4, 5, 6, 8, 10, 11.55]) {
        const c = document.createElement('canvas');
        c.width = W + PAD * 2; c.height = H + PAD * 2;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.filter = `blur(${s}px)`;
        x.drawImage(A, X - PAD, Y - PAD, W + PAD * 2, H + PAD * 2, 0, 0, W + PAD * 2, H + PAD * 2);
        x.filter = 'none';
        const d = x.getImageData(PAD, PAD, W, H).data;
        const c2 = document.createElement('canvas');
        c2.width = W; c2.height = H;
        const x2 = c2.getContext('2d', { willReadFrequently: true });
        x2.putImageData(new ImageData(new Uint8ClampedArray(d), W, H), 0, 0);
        calib.push([s, lap(gray(x2.getImageData(0, 0, W, H).data))]);
      }
      return { HF, calib };
    },
    { ua: toUrl(sharpF), ub: toUrl(refF), uc: toUrl(mineF), X, Y, W, H }
  );
  console.log('detail energy (mean |Laplacian|):');
  console.log(`  sharp(old port): ${res.HF.sharp.toFixed(3)}`);
  console.log(`  ref(original):   ${res.HF.ref.toFixed(3)}`);
  console.log(`  mine(current):   ${res.HF.mine.toFixed(3)}`);
  console.log('calibration (sharp blurred by sigma):');
  res.calib.forEach(([s, v]) => console.log(`  sigma ${s}: ${v.toFixed(3)}`));
  await browser.close();
})();
