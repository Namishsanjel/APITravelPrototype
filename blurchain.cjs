// Controlled experiment: how do stacked backdrop-filter layers composite in
// Chromium, and which structure matches the reference card rendering?
// Usage: node blurchain.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const sharp = 'data:image/png;base64,' + fs.readFileSync(path.resolve('shots/sharp-card.png')).toString('base64');
const ref = 'data:image/png;base64,' + fs.readFileSync(path.resolve('shots/ref-card.png')).toString('base64');

const GRAD = 'linear-gradient(rgba(10, 18, 12, 0.36) 0%, rgba(10, 18, 12, 0) 30%, rgba(8, 14, 10, 0.2) 65%, rgba(6, 12, 8, 0.36) 100%)';
const ALL = [0.078125, 0.15625, 0.3125, 0.625, 1.25, 2.5, 5, 10];
const FIRST5 = ALL.slice(0, 5);

const box = (layers, { zed = false, wrap = false } = {}) => {
  const inner = layers
    .map((b, i) => `<div style="position:absolute;inset:0;border-radius:4px;${zed ? `z-index:${i + 1};` : ''}backdrop-filter:blur(${b}px)"></div>`)
    .join('');
  const stack = wrap
    ? `<div style="position:absolute;inset:0;z-index:2"><div style="position:relative">${inner}</div></div>`
    : `<div style="position:absolute;inset:0">${inner}</div>`;
  return `
    <div class="card" style="position:relative;width:613px;height:592px;overflow:hidden;border-radius:4px">
      <img src="${sharp}" style="position:absolute;inset:0;width:613px;height:592px;object-fit:cover" />
      ${stack}
    </div>`;
};

const VARIANTS = {
  G_sharp: `<div class="card" style="position:relative;width:613px;height:592px;overflow:hidden;border-radius:4px"><img src="${sharp}" style="position:absolute;inset:0;width:613px;height:592px;object-fit:cover" /></div>`,
  // faithful repro of the original DOM: img in z0 SC, gradient slot z1, blur container z2 > z-auto > layers z1..z8
  O_exact: `
    <div class="card" style="position:relative;width:613px;height:592px;overflow:hidden;border-radius:4px">
      <div style="position:absolute;z-index:2">
        <div style="position:absolute;inset:0">
          ${ALL.map((b, i) => `<div style="position:absolute;inset:0;border-radius:4px;z-index:${i + 1};backdrop-filter:blur(${b}px)"></div>`).join('')}
        </div>
      </div>
      <div style="position:absolute;z-index:0">
        <div style="position:absolute;inset:0">
          <img src="${sharp}" style="position:absolute;inset:0;width:613px;height:592px;object-fit:cover" />
        </div>
      </div>
      <div style="position:absolute;inset:0;z-index:1"></div>
    </div>`,
  // same as O but layers without z-index
  P_exact_nozed: `
    <div class="card" style="position:relative;width:613px;height:592px;overflow:hidden;border-radius:4px">
      <div style="position:absolute;z-index:2">
        <div style="position:absolute;inset:0">
          ${ALL.map((b) => `<div style="position:absolute;inset:0;border-radius:4px;backdrop-filter:blur(${b}px)"></div>`).join('')}
        </div>
      </div>
      <div style="position:absolute;z-index:0">
        <div style="position:absolute;inset:0">
          <img src="${sharp}" style="position:absolute;inset:0;width:613px;height:592px;object-fit:cover" />
        </div>
      </div>
    </div>`,
  A_8zed: box(ALL, { zed: false }),
  B_8zed_wrap: box(ALL, { zed: true, wrap: true }),
  C_single10: box([10]),
  D_single144: box([1.44]),
  E_first5: box(FIRST5),
  F_first5_zed: box(FIRST5, { zed: true }),
  H_single1: box([1]),
  I_single2: box([2]),
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 700, height: 650 } });
  const names = Object.keys(VARIANTS);
  const results = [];
  for (const name of names) {
    await page.setContent(
      `<body style="margin:0;background:#000">${VARIANTS[name]}</body>`,
      { waitUntil: 'load' }
    );
    await page.waitForTimeout(150);
    const el = await page.$('.card');
    const buf = await el.screenshot({ type: 'png' });
    fs.writeFileSync(path.resolve(`shots/variant-${name}.png`), buf);
    results.push(name);
  }
  // score each variant against ref-card.png
  const shots = {};
  for (const name of results) {
    shots[name] = fs.readFileSync(path.resolve(`shots/variant-${name}.png`)).toString('base64');
  }
  const scores = await page.evaluate(async ({ names, ref, shots }) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
    const W = 613, H = 592;
    const grab = (img) => {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, W, H).data;
    };
    const gray = (d) => {
      const g = new Float64Array(W * H);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) g[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      return g;
    };
    const lap = (g) => {
      let s = 0, n = 0;
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        s += Math.abs(4 * g[i] - g[i - 1] - g[i + 1] - g[i - W] - g[i + W]); n++;
      }
      return s / n;
    };
    const R = await load(ref);
    const Rd = grab(R);
    const Rg = gray(Rd);
    const out = [];
    for (const name of names) {
      const u = 'data:image/png;base64,' + shots[name];
      const V = await load(u);
      const Vd = grab(V);
      let sum = 0, psum = 0, pn = 0;
      for (let i = 0; i < Vd.length; i += 4) {
        sum += Math.abs(Vd[i] - Rd[i]) + Math.abs(Vd[i + 1] - Rd[i + 1]) + Math.abs(Vd[i + 2] - Rd[i + 2]);
      }
      // photo-only band (crop y60..460: below chips, above h3 text)
      for (let y = 60; y < 460; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          psum += Math.abs(Vd[i] - Rd[i]) + Math.abs(Vd[i + 1] - Rd[i + 1]) + Math.abs(Vd[i + 2] - Rd[i + 2]);
          pn += 3;
        }
      }
      out.push([name, (sum / (W * H * 3)).toFixed(3), lap(gray(Vd)).toFixed(3), (psum / pn).toFixed(3)]);
    }
    out.push(['REF', '-', lap(Rg).toFixed(3), '-']);
    return out;
  }, { names, ref, shots });
  console.log('variant         mad-vs-ref  detail  photo-mad');
  scores.forEach(([n, m, h, p]) => console.log(`${n.padEnd(15)} ${String(m).padStart(8)}  ${String(h).padStart(6)}  ${String(p).padStart(8)}`));
  await browser.close();
})();
