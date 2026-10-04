// Find the (sub)pixel shift that minimizes mad between two PNGs.
// Usage: node shiftsearch.cjs <a.png> <b.png> [x y w h]
const { chromium } = require('playwright');
const fs = require('fs');
const [A, B, RX, RY, RW, RH] = process.argv.slice(2);
const REGION = RX !== undefined ? { x: +RX, y: +RY, w: +RW, h: +RH } : null;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const bufs = [A, B].map((f) => fs.readFileSync(f).toString('base64'));
  const res = await page.evaluate(async ({ bufs, REG }) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
    const imgs = await Promise.all(bufs.map(load));
    const W = REG ? REG.w : Math.min(imgs[0].width, imgs[1].width);
    const H = REG ? REG.h : Math.min(imgs[0].height, imgs[1].height);
    const grab = (img) => {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      if (REG) x.drawImage(img, REG.x, REG.y, REG.w, REG.h, 0, 0, REG.w, REG.h);
      else x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, W, H).data;
    };
    const [Da, Db] = imgs.map(grab);
    const at = (D, x, y, c) => D[((Math.max(0, Math.min(H - 1, y)) * W) + Math.max(0, Math.min(W - 1, x))) * 4 + c];
    const madShift = (sx, sy) => {
      let s = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          for (let c = 0; c < 3; c++) {
            // bilinear sample of Db at (x - sx, y - sy)
            const fx = x - sx, fy = y - sy;
            const x0 = Math.floor(fx), y0 = Math.floor(fy);
            const tx = fx - x0, ty = fy - y0;
            const v =
              at(Db, x0, y0, c) * (1 - tx) * (1 - ty) +
              at(Db, x0 + 1, y0, c) * tx * (1 - ty) +
              at(Db, x0, y0 + 1, c) * (1 - tx) * ty +
              at(Db, x0 + 1, y0 + 1, c) * tx * ty;
            s += Math.abs(at(Da, x, y, c) - v);
          }
        }
      }
      return s / (W * H * 3);
    };
    const out = [];
    for (const sy of [-1, -0.5, 0, 0.5, 1]) {
      const row = [];
      for (const sx of [-1, -0.5, 0, 0.5, 1]) {
        row.push(`${sx},${sy}=${madShift(sx, sy).toFixed(3)}`);
      }
      out.push(row.join('  '));
    }
    return out;
  }, { bufs, REG: REGION });
  res.forEach((l) => console.log(l));
  await browser.close();
})();
