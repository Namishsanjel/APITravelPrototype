// Scoped will-change experiment for buttons/nav.
// Variants injected as <style> into the port page; full-page captures measured vs orig.
//   A: current (btn wc on)                 — baseline
//   B: .btn wc off everywhere
//   C: .btn wc off + header wc on          (orig: framer-1i9clgj-container wc)
//   D: C + nav links (.t-link under header) wc off
const { chromium } = require('playwright');
const fs = require('fs');

const URL = 'http://localhost:5173/hikes';

const VARIANTS = [
  ['A-current', ''],
  ['B-nobtnwc', '.btn{will-change:auto !important}'],
  ['C-headerwc', '.btn{will-change:auto !important} header{will-change:transform}'],
  ['D-navlinks', '.btn{will-change:auto !important} header{will-change:transform} header .t-link{will-change:auto !important}'],
];

const REGIONS = [
  { label: 'nav-btn', x: 1000, y: 20, w: 350, h: 55 },
  { label: 'nav-links', x: 600, y: 20, w: 500, h: 55 },
  { label: 'nav-logo', x: 70, y: 20, w: 200, h: 55 },
  { label: 'navbar', x: 0, y: 0, w: 1440, h: 100 },
  { label: 'cta-btn', x: 640, y: 4390, w: 160, h: 50 },
  { label: 'card-btn', x: 110, y: 830, w: 250, h: 55 },
  { label: 'links-right', x: 820, y: 4590, w: 520, h: 120 },
  { label: 'full', x: 0, y: 0, w: 1440, h: 5074 },
];

(async () => {
  const browser = await chromium.launch();
  const p2 = await browser.newPage();
  const REF = fs.readFileSync('shots/hikes-desktop.png').toString('base64');

  for (const [name, css] of VARIANTS) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    if (css) await page.addStyleTag({ content: css });
    await page.waitForTimeout(300);
    const file = `shots/scope-${name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    await page.close();

    const cur = fs.readFileSync(file).toString('base64');
    const out = await p2.evaluate(async ({ REF, cur, REGIONS }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
      const [A, B] = await Promise.all([load(REF), load(cur)]);
      const grab = (img, r) => {
        const c = document.createElement('canvas');
        c.width = r.w; c.height = r.h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
        return x.getImageData(0, 0, r.w, r.h).data;
      };
      return REGIONS.map((r) => {
        const Da = grab(A, r), Db = grab(B, r);
        let s = 0;
        for (let i = 0; i < Da.length; i += 4) s += Math.abs(Da[i] - Db[i]) + Math.abs(Da[i + 1] - Db[i + 1]) + Math.abs(Da[i + 2] - Db[i + 2]);
        return `${r.label}=${(s / (Da.length / 4) / 3).toFixed(3)}`;
      }).join('  ');
    }, { REF, cur, REGIONS });
    console.log(`${name}: ${out}`);
    await p2.close && null; // p2 reused below via new page each loop is wasteful; keep one
  }
  await browser.close();
})();
