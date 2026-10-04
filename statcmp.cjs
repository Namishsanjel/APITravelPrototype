// Per-shot glyph statistics: bright-pixel channel means, fringe counts, top colors.
// Usage: node statcmp.cjs file1 file2 ...
const { chromium } = require('playwright');
const fs = require('fs');
const files = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const bufs = files.map((f) => fs.readFileSync(f).toString('base64'));
  const res = await page.evaluate(async (bufs) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
    const imgs = await Promise.all(bufs.map(load));
    return imgs.map((img) => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let n = 0, mr = 0, mg = 0, mb = 0, fringe = 0, tot = 0, mx = 0;
      let hist = {};
      for (let i = 0; i < d.length; i += 4) {
        const R = d[i], G = d[i + 1], B = d[i + 2];
        const lum = 0.299 * R + 0.587 * G + 0.114 * B;
        if (lum > 60) tot++;
        if (lum > 150) {
          n++; mr += R; mg += G; mb += B;
          if (lum > mx) mx = lum;
          if (Math.max(R, G, B) - Math.min(R, G, B) > 30) fringe++;
          const key = `${R},${G},${B}`;
          hist[key] = (hist[key] || 0) + 1;
        }
      }
      const top = Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 5);
      return {
        size: `${c.width}x${c.height}`,
        bright: n,
        meanRGB: n ? `${(mr / n).toFixed(1)},${(mg / n).toFixed(1)},${(mb / n).toFixed(1)}` : '-',
        fringeOfBright: n ? ((fringe / n) * 100).toFixed(1) + '%' : '-',
        maxLum: mx.toFixed(1),
        topColors: top.map(([k, v]) => `${k}x${v}`).join(' | '),
      };
    });
  }, bufs);
  res.forEach((r, i) => {
    console.log(`--- ${files[i]}`);
    console.log(JSON.stringify(r, null, 1));
  });
  await browser.close();
})();
