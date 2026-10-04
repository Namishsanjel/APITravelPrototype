// Text-region fringe/energy comparison between orig and port full-page shots.
// Usage: node regionscan.cjs <orig.png> <port.png> <x,y,w,h,label> ...
const { chromium } = require('playwright');
const fs = require('fs');
const [, , A, B, ...rest] = process.argv;
const regions = rest.map((s) => {
  const [x, y, w, h, ...label] = s.split(',');
  return { x: +x, y: +y, w: +w, h: +h, label: label.join(',') };
});
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const bufs = [A, B].map((f) => fs.readFileSync(f).toString('base64'));
  const res = await page.evaluate(
    async ({ bufs, regions }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
      const imgs = await Promise.all(bufs.map(load));
      const grab = (img, r) => {
        const c = document.createElement('canvas');
        c.width = r.w; c.height = r.h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
        return x.getImageData(0, 0, r.w, r.h).data;
      };
      return regions.map((r) => {
        const Da = grab(imgs[0], r), Db = grab(imgs[1], r);
        const stat = (d) => {
          let n = 0, fringe = 0, e = 0;
          for (let i = 0; i < d.length; i += 4) {
            const R = d[i], G = d[i + 1], B = d[i + 2];
            const lum = 0.299 * R + 0.587 * G + 0.114 * B;
            e += lum;
            if (lum > 140) {
              n++;
              if (Math.max(R, G, B) - Math.min(R, G, B) > 30) fringe++;
            }
          }
          return { n, fringe: n ? fringe / n : 0, energy: e / (d.length / 4) };
        };
        const sa = stat(Da), sb = stat(Db);
        let mad = 0;
        for (let i = 0; i < Da.length; i += 4) mad += Math.abs(Da[i] - Db[i]) + Math.abs(Da[i + 1] - Db[i + 1]) + Math.abs(Da[i + 2] - Db[i + 2]);
        mad /= Da.length / 4; mad /= 3;
        return {
          label: r.label,
          orig: `fringe=${(sa.fringe * 100).toFixed(1)}% bright=${sa.n} energy=${sa.energy.toFixed(1)}`,
          port: `fringe=${(sb.fringe * 100).toFixed(1)}% bright=${sb.n} energy=${sb.energy.toFixed(1)}`,
          mad: mad.toFixed(2),
        };
      });
    },
    { bufs, regions }
  );
  res.forEach((r) => console.log(`${r.label}\n  orig ${r.orig}\n  port ${r.port}\n  mad=${r.mad}`));
  await browser.close();
})();
