// Fit the effective Gaussian blur sigma of a region against a sharp reference.
// Usage: node fitblur.cjs <sharp.png> <blurred.png> <x> <y> <w> <h>
// sharp.png = known-unblurred render, blurred.png = target to match.
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
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, X, Y, W, H, 0, 0, W, H);
        return x.getImageData(0, 0, W, H).data;
      };
      const S = grab(A), T = grab(B);
      const sigmas = [0, 0.5, 1, 1.5, 2, 2.5, 2.89, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 11.55];
      const PAD = 40;
      const results = [];
      for (const s of sigmas) {
        const c = document.createElement('canvas');
        c.width = W + PAD * 2; c.height = H + PAD * 2;
        const x = c.getContext('2d', { willReadFrequently: true });
        // tile edges to avoid border artifacts
        x.drawImage(c, 0, 0); // no-op keeps context alive
        x.filter = `blur(${s}px)` || 'none';
        x.drawImage(A, X - PAD, Y - PAD, W + PAD * 2, H + PAD * 2, 0, 0, W + PAD * 2, H + PAD * 2);
        x.filter = 'none';
        const D = x.getImageData(PAD, PAD, W, H).data;
        let sum = 0, n = W * H * 3;
        for (let i = 0; i < D.length; i += 4) {
          sum += Math.abs(D[i] - T[i]) + Math.abs(D[i + 1] - T[i + 1]) + Math.abs(D[i + 2] - T[i + 2]);
        }
        results.push([s, (sum / n).toFixed(3)]);
      }
      // sharp (no blur) baseline
      let sum = 0;
      for (let i = 0; i < S.length; i += 4) {
        sum += Math.abs(S[i] - T[i]) + Math.abs(S[i + 1] - T[i + 1]) + Math.abs(S[i + 2] - T[i + 2]);
      }
      return { results, sharpMad: (sum / (W * H * 3)).toFixed(3) };
    },
    { ua: toUrl(sharp), ub: toUrl(targ), X, Y, W, H }
  );
  console.log(`sharp-vs-target mad: ${res.sharpMad}`);
  res.results.forEach(([s, m]) => console.log(`sigma ${s}: mad ${m}`));
  await browser.close();
})();
