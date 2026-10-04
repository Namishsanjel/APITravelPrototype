// Hypothesis test: orig text AA is grayscale because the footer content lives
// inside a masked (composited) wrapper. Screenshot the subline element, remove
// the mask in-page, re-screenshot, compare both against the port element shot.
// Usage: node maskexp.cjs
const { chromium } = require('playwright');
const fs = require('fs');

const ORIG = 'http://localhost:8091/trova-travel.framer.website/hikes.html';
const PORT = 'http://localhost:5173/hikes';
const SUB = 'Guided hikes, breathtaking';

async function shotSubline(page, file) {
  const handle = await page.evaluateHandle((sub) => {
    const walk = (el) => {
      for (const c of el.children) {
        const h = walk(c);
        if (h) return h;
      }
      if (el.children.length === 0 && (el.textContent || '').includes(sub)) return el;
      return null;
    };
    return walk(document.body);
  }, SUB);
  const el = handle.asElement();
  if (!el) throw new Error('subline not found');
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  fs.writeFileSync(file, await el.screenshot({ type: 'png' }));
}

(async () => {
  const browser = await chromium.launch();

  // orig: baseline
  const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1.goto(ORIG, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page1.waitForTimeout(2500);
  await shotSubline(page1, 'shots/mask-orig-on.png');

  // orig: mask removed
  await page1.evaluate(() => {
    const el = document.querySelector('.framer-10r15ww');
    el.style.maskImage = 'none';
    el.style.webkitMaskImage = 'none';
  });
  await page1.waitForTimeout(600);
  await shotSubline(page1, 'shots/mask-orig-off.png');
  await page1.close();

  // port baseline (fresh)
  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page2.goto(PORT, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page2.waitForTimeout(2500);
  await shotSubline(page2, 'shots/mask-port.png');
  await page2.close();

  // compare all pairs
  const page3 = await browser.newPage();
  const files = ['shots/mask-orig-on.png', 'shots/mask-orig-off.png', 'shots/mask-port.png'];
  const names = ['orig-on', 'orig-off', 'port'];
  const bufs = files.map((f) => fs.readFileSync(f).toString('base64'));
  const res = await page3.evaluate(
    async ({ bufs, names }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
      const imgs = await Promise.all(bufs.map(load));
      const grab = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, c.width, c.height).data;
      };
      const D = imgs.map(grab);
      const out = [];
      for (let a = 0; a < D.length; a++) {
        for (let b = a + 1; b < D.length; b++) {
          let sum = 0, n = 0;
          for (let i = 0; i < D[a].length; i += 4) {
            sum += Math.abs(D[a][i] - D[b][i]) + Math.abs(D[a][i + 1] - D[b][i + 1]) + Math.abs(D[a][i + 2] - D[b][i + 2]);
            n += 3;
          }
          out.push(`${names[a]} vs ${names[b]}: mad=${(sum / n).toFixed(3)}`);
        }
      }
      return out;
    },
    { bufs, names }
  );
  res.forEach((l) => console.log(l));
  await browser.close();
})();
