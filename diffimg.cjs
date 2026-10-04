// Amplified absolute-difference image of a region between two PNGs.
// Usage: node diffimg.cjs <a.png> <b.png> <x> <y> <w> <h> <out.png> [scale] [gain]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [a, b, X, Y, W, H, out] = process.argv.slice(2, 9);
const SCALE = Number(process.argv[9] || 2);
const GAIN = Number(process.argv[10] || 4);
const [Xn, Yn, Wn, Hn] = [Number(X), Number(Y), Number(W), Number(H)];
const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const dataUrl = await page.evaluate(
    async ({ ua, ub, X, Y, W, H, SCALE, GAIN }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, X, Y, W, H, 0, 0, W, H);
        return x.getImageData(0, 0, W, H).data;
      };
      const Da = grab(A), Db = grab(B);
      const c = document.createElement('canvas');
      c.width = W * SCALE; c.height = H * SCALE;
      const ctx = c.getContext('2d');
      const id = ctx.createImageData(W * SCALE, H * SCALE);
      for (let y = 0; y < H * SCALE; y++) {
        for (let x = 0; x < W * SCALE; x++) {
          const sx = (x / SCALE) | 0, sy = (y / SCALE) | 0;
          const i = (sy * W + sx) * 4;
          const o = (y * W * SCALE + x) * 4;
          id.data[o] = Math.min(255, Math.abs(Da[i] - Db[i]) * GAIN);
          id.data[o + 1] = Math.min(255, Math.abs(Da[i + 1] - Db[i + 1]) * GAIN);
          id.data[o + 2] = Math.min(255, Math.abs(Da[i + 2] - Db[i + 2]) * GAIN);
          id.data[o + 3] = 255;
        }
      }
      ctx.putImageData(id, 0, 0);
      return c.toDataURL('image/png');
    },
    { ua: toUrl(a), ub: toUrl(b), X: Xn, Y: Yn, W: Wn, H: Hn, SCALE, GAIN }
  );
  fs.writeFileSync(path.resolve(out), Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', out);
  await browser.close();
})();
