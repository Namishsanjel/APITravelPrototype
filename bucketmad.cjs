// Mad by luminance bucket between two same-size PNGs.
// Usage: node bucketmad.cjs <a.png> <b.png>
const { chromium } = require('playwright');
const fs = require('fs');
const [A, B] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const bufs = [A, B].map((f) => fs.readFileSync(f).toString('base64'));
  const res = await page.evaluate(async (bufs) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
    const imgs = await Promise.all(bufs.map(load));
    const W = Math.min(imgs[0].width, imgs[1].width), H = Math.min(imgs[0].height, imgs[1].height);
    const grab = (img) => {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, W, H).data;
    };
    const [Da, Db] = imgs.map(grab);
    const buckets = Array.from({ length: 4 }, () => ({ n: 0, s: 0 }));
    let total = 0;
    for (let i = 0; i < Da.length; i += 4) {
      const la = 0.299 * Da[i] + 0.587 * Da[i + 1] + 0.114 * Da[i + 2];
      const b = Math.min(3, (la / 64) | 0);
      const d = (Math.abs(Da[i] - Db[i]) + Math.abs(Da[i + 1] - Db[i + 1]) + Math.abs(Da[i + 2] - Db[i + 2])) / 3;
      buckets[b].n++; buckets[b].s += d; total += d;
    }
    const names = ['0-63 dark', '64-127', '128-191', '192-255 bright'];
    return buckets.map((bk, i) => `${names[i]}: n=${bk.n} mad=${bk.n ? (bk.s / bk.n).toFixed(2) : '-'}`);
  }, bufs);
  res.forEach((l) => console.log(l));
  await browser.close();
})();
