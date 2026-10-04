// Split a region into glyph vs backdrop pixels and report per-side stats + mad.
// Usage: node glyphstat.cjs <orig.png> <port.png> <x> <y> <w> <h> [lumThreshold]
const { chromium } = require('playwright');
const fs = require('fs');
const [, , A, B, X, Y, W, H] = process.argv;
const TH = Number(process.argv[7] || 170);
const R = { x: +X, y: +Y, w: +W, h: +H };
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const bufs = [A, B].map((f) => fs.readFileSync(f).toString('base64'));
  const res = await page.evaluate(
    async ({ bufs, R, TH }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
      const imgs = await Promise.all(bufs.map(load));
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = R.w; c.height = R.h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, R.x, R.y, R.w, R.h, 0, 0, R.w, R.h);
        return x.getImageData(0, 0, R.w, R.h).data;
      };
      const [Da, Db] = imgs.map(grab);
      const acc = { gA: { n: 0, r: 0, g: 0, b: 0 }, gB: { n: 0, r: 0, g: 0, b: 0 }, bA: { n: 0, r: 0, g: 0, b: 0 }, bB: { n: 0, r: 0, g: 0, b: 0 } };
      let madGlyph = 0, nGlyph = 0, madBack = 0, nBack = 0;
      for (let i = 0; i < Da.length; i += 4) {
        const la = 0.299 * Da[i] + 0.587 * Da[i + 1] + 0.114 * Da[i + 2];
        const lb = 0.299 * Db[i] + 0.587 * Db[i + 1] + 0.114 * Db[i + 2];
        const isGlyph = la > TH || lb > TH;
        const d = Math.abs(Da[i] - Db[i]) + Math.abs(Da[i + 1] - Db[i + 1]) + Math.abs(Da[i + 2] - Db[i + 2]);
        if (isGlyph) { madGlyph += d; nGlyph++; } else { madBack += d; nBack++; }
        const ta = isGlyph ? acc.gA : acc.bA, tb = isGlyph ? acc.gB : acc.bB;
        ta.n++; ta.r += Da[i]; ta.g += Da[i + 1]; ta.b += Da[i + 2];
        tb.n++; tb.r += Db[i]; tb.g += Db[i + 1]; tb.b += Db[i + 2];
      }
      const fmt = (s) => `n=${s.n} mean=${(s.r / s.n).toFixed(1)},${(s.g / s.n).toFixed(1)},${(s.b / s.n).toFixed(1)}`;
      return {
        glyphOrig: fmt(acc.gA), glyphPort: fmt(acc.gB),
        backOrig: fmt(acc.bA), backPort: fmt(acc.bB),
        madGlyph: (madGlyph / nGlyph / 3).toFixed(2),
        madBack: (madBack / nBack / 3).toFixed(2),
        shareGlyph: ((nGlyph / (nGlyph + nBack)) * 100).toFixed(0) + '%',
      };
    },
    { bufs, R, TH }
  );
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
