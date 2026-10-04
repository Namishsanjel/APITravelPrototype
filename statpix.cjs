// Numeric region stats for a PNG: mean RGB, per-channel std, mean saturation.
// Usage: node statpix.cjs <img.png> <x> <y> <w> <h> [more regions...]
const { chromium } = require('playwright');
const fs = require('fs');
const F = process.argv[2];
const regions = [];
for (let i = 3; i < process.argv.length; i += 4) {
  regions.push({ x: +process.argv[i - 0 - 1 + 1] });
}
// simpler: args 3.. are x y w h tuples
const tuples = [];
for (let i = 3; i + 3 < process.argv.length + 1; i += 4) {
  const t = process.argv.slice(i, i + 4).map(Number);
  if (t.length === 4 && t.every((n) => !isNaN(n))) tuples.push({ x: t[0], y: t[1], w: t[2], h: t[3] });
  else break;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const buf = fs.readFileSync(F).toString('base64');
  const out = await page.evaluate(
    async ({ buf, tuples }) => {
      const img = await new Promise((r) => {
        const i = new Image();
        i.onload = () => r(i);
        i.src = 'data:image/png;base64,' + buf;
      });
      const c = document.createElement('canvas');
      const res = [`size=${img.width}x${img.height}`];
      for (const t of tuples) {
        c.width = t.w; c.height = t.h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.clearRect(0, 0, t.w, t.h);
        x.drawImage(img, t.x, t.y, t.w, t.h, 0, 0, t.w, t.h);
        const d = x.getImageData(0, 0, t.w, t.h).data;
        let sr = 0, sg = 0, sb = 0, n = 0, sat = 0;
        const rr = [], gg = [], bb = [];
        for (let i = 0; i < d.length; i += 4) { rr.push(d[i]); gg.push(d[i + 1]); bb.push(d[i + 2]); sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++; }
        const mr = sr / n, mg = sg / n, mb = sb / n;
        const sd = (a, m) => Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length);
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
          sat += mx === 0 ? 0 : (mx - mn) / mx;
        }
        res.push(`  [${t.x},${t.y},${t.w},${t.h}] mean=${mr.toFixed(0)},${mg.toFixed(0)},${mb.toFixed(0)} std=${sd(rr, mr).toFixed(1)},${sd(gg, mg).toFixed(1)},${sd(bb, mb).toFixed(1)} sat=${(sat / n).toFixed(3)}`);
      }
      return res;
    },
    { buf, tuples }
  );
  console.log(F);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
