// A) ancestor chains of nav + cta button text (orig and port)
// B) toggle .btn will-change OFF in port, full-page captures, compare
//    card-button shift + cta/nav button regions for both states.
const { chromium } = require('playwright');
const fs = require('fs');

const ORIG = 'http://localhost:8091/trova-travel.framer.website/hikes.html';
const PORT = 'http://localhost:5173/hikes';

const chainJS = (snip) => {
  const s = snip.toLowerCase();
  let el = null;
  const walk = (e) => {
    if (el) return;
    if (e.children.length === 0 && (e.textContent || '').toLowerCase().includes(s)) { el = e; return; }
    for (const c of e.children) walk(c);
  };
  walk(document.body);
  if (!el) return ['not found: ' + snip];
  const lines = [];
  let n = el;
  for (let i = 0; i < 7 && n; i++) {
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    const bits = [];
    if (cs.willChange !== 'auto') bits.push('wc=' + cs.willChange);
    if (cs.transform !== 'none') bits.push('tf');
    if (cs.opacity !== '1') bits.push('op=' + cs.opacity);
    if (cs.overflow !== 'visible') bits.push('ov=' + cs.overflow);
    lines.push(i + ' <' + n.tagName.toLowerCase() + '> y' + (r.y + scrollY).toFixed(3) + ' ' + r.width.toFixed(1) + 'x' + r.height.toFixed(1) + ' ' + (n.className || '').toString().slice(0, 34) + (bits.length ? ' :: ' + bits.join(' ') : ''));
    n = n.parentElement;
  }
  return lines;
};

async function shotClip(page, file) {
  await page.screenshot({ path: file, fullPage: true });
}

(async () => {
  const browser = await chromium.launch();

  // --- A) chains
  for (const url of [ORIG, PORT]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2200);
    for (const snip of ['book your hike', 'explore all hikes']) {
      const lines = await page.evaluate(chainJS, snip);
      console.log(`=== ${url} [${snip}]`);
      lines.forEach((l) => console.log('  ' + l));
    }
    await page.close();
  }

  // --- B) A/B capture of port
  const variants = [
    ['wc-on', () => {}],
    ['wc-off', () => { document.querySelectorAll('.btn').forEach((e) => { e.style.willChange = 'auto'; }); }],
  ];
  for (const [name, fn] of variants) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(PORT, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.evaluate(fn);
    await page.waitForTimeout(400);
    await shotClip(page, `shots/btn-${name}.png`, 0, 0, 1440, 5074);
    await page.close();
  }

  // --- compare vs orig reference
  const p2 = await browser.newPage();
  const REF = fs.readFileSync('shots/hikes-desktop.png').toString('base64');
  const regions = [
    { label: 'card-btn', x: 110, y: 830, w: 250, h: 55 },
    { label: 'cta-btn', x: 640, y: 4390, w: 160, h: 50 },
    { label: 'nav-btn', x: 1000, y: 20, w: 350, h: 55 },
    { label: 'navbar', x: 0, y: 0, w: 1440, h: 100 },
    { label: 'full', x: 0, y: 0, w: 1440, h: 5074 },
  ];
  for (const [name] of variants) {
    const cur = fs.readFileSync(`shots/btn-${name}.png`).toString('base64');
    const out = await p2.evaluate(async ({ REF, cur, regions }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
      const [A, B] = await Promise.all([load(REF), load(cur)]);
      const grab = (img, r) => {
        const c = document.createElement('canvas');
        c.width = r.w; c.height = r.h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
        return x.getImageData(0, 0, r.w, r.h).data;
      };
      return regions.map((r) => {
        const Da = grab(A, r), Db = grab(B, r);
        let s = 0;
        for (let i = 0; i < Da.length; i += 4) s += Math.abs(Da[i] - Db[i]) + Math.abs(Da[i + 1] - Db[i + 1]) + Math.abs(Da[i + 2] - Db[i + 2]);
        return `${r.label}=${(s / (Da.length / 4) / 3).toFixed(3)}`;
      }).join('  ');
    }, { REF, cur, regions });
    console.log(`${name}: ${out}`);
  }
  await browser.close();
})();
