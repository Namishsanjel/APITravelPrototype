// Fit effective blur sigma WITH sub-pixel alignment search.
// Usage: node fitblur2.cjs <sharp.png> <blurred.png> <x> <y> <w> <h>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [sharp, targ, X, Y, W, H] = [process.argv[2], process.argv[3], ...process.argv.slice(4, 8).map(Number)];
const toUrl = (f) => 'data:image/png;base64,' + fs.readFileSync(path.resolve(f)).toString('base64');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = await page.evaluate(
    async ({ ua, ub, X, Y, W, H }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
      const [A, B] = await Promise.all([load(ua), load(ub)]);
      const grab = (img, ox, oy) => {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, X + ox, Y + oy, W, H, 0, 0, W, H);
        return x.getImageData(0, 0, W, H).data;
      };
      const T = grab(B, 0, 0);
      const sigmas = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 11.55];
      const shifts = [-1, -0.5, -0.25, 0, 0.25, 0.5, 1];
      const PAD = 48;
      const results = [];
      for (const s of sigmas) {
        let best = null;
        for (const sy of shifts) {
          for (const sx of shifts) {
            const c = document.createElement('canvas');
            c.width = W + PAD * 2; c.height = H + PAD * 2;
            const x = c.getContext('2d', { willReadFrequently: true });
            x.filter = `blur(${s}px)`;
            x.drawImage(A, X - PAD + sx, Y - PAD + sy, W + PAD * 2, H + PAD * 2, 0, 0, W + PAD * 2, H + PAD * 2);
            x.filter = 'none';
            const D = x.getImageData(PAD, PAD, W, H).data;
            let sum = 0;
            for (let i = 0; i < D.length; i += 4) {
              sum += Math.abs(D[i] - T[i]) + Math.abs(D[i + 1] - T[i + 1]) + Math.abs(D[i + 2] - T[i + 2]);
            }
            const mad = sum / (W * H * 3);
            if (!best || mad < best[1]) best = [sx, sy, mad];
          }
        }
        results.push([s, best[0], best[1], best[2].toFixed(3)]);
      }
      return results;
    },
    { ua: toUrl(sharp), ub: toUrl(targ), X, Y, W, H }
  );
  res.forEach(([s, sx, sy, m]) => console.log(`sigma ${s}: mad ${m} (dx=${sx} dy=${sy})`));
  await browser.close();
})();
