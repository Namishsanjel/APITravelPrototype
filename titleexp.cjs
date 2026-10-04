// Card-title raster experiment: screenshot the h3 on orig (reference) and on
// port under style variants, report mad vs orig for each variant.
// Variants: base, will-change, geometricPrecision, smoothing-antialiased,
//           smoothing-subpixel, kerning-none.
// Usage: node titleexp.cjs
const { chromium } = require('playwright');
const fs = require('fs');

const ORIG = 'http://localhost:8091/trova-travel.framer.website/hikes.html';
const PORT = 'http://localhost:5173/hikes';
const SUB = 'Annapurna Base Camp';

async function shotTitle(page, file) {
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
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  fs.writeFileSync(file, await el.screenshot({ type: 'png' }));
  return el;
}

const VARIANTS = [
  ['base', () => {}],
  ['wc', (el) => { el.style.willChange = 'transform'; }],
  ['geomPrec', (el) => { el.style.textRendering = 'geometricPrecision'; }],
  ['smoothAA', (el) => { el.style.webkitFontSmoothing = 'antialiased'; }],
  ['smoothSub', (el) => { el.style.webkitFontSmoothing = 'subpixel-antialiased'; }],
  ['kernNone', (el) => { el.style.fontKerning = 'none'; }],
  ['tz', (el) => { el.style.transform = 'translateZ(0)'; }],
];

(async () => {
  const browser = await chromium.launch();

  // reference: orig title element shot
  const p1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p1.goto(ORIG, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await p1.waitForTimeout(2500);
  await shotTitle(p1, 'shots/titleref.png');
  // also dump computed font-smoothing of the orig title
  const smooth = await p1.evaluate((sub) => {
    const walk = (el) => {
      for (const c of el.children) { const h = walk(c); if (h) return h; }
      if (el.children.length === 0 && (el.textContent || '').includes(sub)) return el;
      return null;
    };
    const el = walk(document.body);
    const cs = getComputedStyle(el);
    const parent = el.parentElement;
    return {
      self: cs.webkitFontSmoothing,
      parent: parent ? getComputedStyle(parent).webkitFontSmoothing : '-',
      parentWC: parent ? getComputedStyle(parent).willChange : '-',
      parentCls: parent ? (parent.className || '').toString().slice(0, 40) : '-',
      rendering: cs.textRendering,
      ls: cs.letterSpacing,
      fvs: cs.fontVariationSettings,
      weight: cs.fontWeight,
      size: cs.fontSize,
      family: cs.fontFamily,
    };
  }, SUB);
  console.log('orig title computed:', JSON.stringify(smooth, null, 1));
  await p1.close();

  // port variants
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p2.goto(PORT, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await p2.waitForTimeout(2500);
  const handle = await p2.evaluateHandle((sub) => {
    const walk = (el) => {
      for (const c of el.children) { const h = walk(c); if (h) return h; }
      if (el.children.length === 0 && (el.textContent || '').includes(sub)) return el;
      return null;
    };
    return walk(document.body);
  }, SUB);
  const el = handle.asElement();
  const portSmooth = await p2.evaluate((e) => {
    const cs = getComputedStyle(e);
    return {
      self: cs.webkitFontSmoothing,
      parent: getComputedStyle(e.parentElement).webkitFontSmoothing,
      rendering: cs.textRendering,
      ls: cs.letterSpacing,
      fvs: cs.fontVariationSettings,
      weight: cs.fontWeight,
      size: cs.fontSize,
      family: cs.fontFamily,
    };
  }, el);
  console.log('port title computed:', JSON.stringify(portSmooth, null, 1));

  const files = [];
  for (const [name, apply] of VARIANTS) {
    // reset
    await p2.evaluate((e) => {
      e.style.willChange = '';
      e.style.textRendering = '';
      e.style.webkitFontSmoothing = '';
      e.style.fontKerning = '';
      e.style.transform = '';
    }, el);
    await p2.evaluate(({ e, fn }) => {
      // eslint-disable-next-line no-new-func
      new Function('e', `(${fn})(e)`)(e);
    }, { e: el, fn: apply.toString() });
    await p2.waitForTimeout(400);
    const f = `shots/title-var-${name}.png`;
    await el.screenshot({ type: 'png' }).then((b) => fs.writeFileSync(f, b));
    files.push([name, f]);
  }
  await p2.close();

  // compare all to reference
  const p3 = await browser.newPage();
  const ref = fs.readFileSync('shots/titleref.png').toString('base64');
  const list = files.map(([n, f]) => [n, fs.readFileSync(f).toString('base64')]);
  const res = await p3.evaluate(
    async ({ ref, list }) => {
      const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
      const R = await load(ref);
      const grab = (img) => {
        const c = document.createElement('canvas');
        const W = Math.min(img.width, R.width), H = Math.min(img.height, R.height);
        c.width = W; c.height = H;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, W, H).data;
      };
      const Dr = grab(R);
      return await Promise.all(
        list.map(async ([name, u]) => {
          const I = await load(u);
          const D = grab(I);
          let s = 0;
          for (let i = 0; i < D.length; i += 4) s += Math.abs(Dr[i] - D[i]) + Math.abs(Dr[i + 1] - D[i + 1]) + Math.abs(Dr[i + 2] - D[i + 2]);
          return `${name}: mad=${(s / (D.length / 4) / 3).toFixed(3)} size=${I.width}x${I.height}`;
        })
      );
    },
    { ref, list }
  );
  res.forEach((l) => console.log(l));
  await browser.close();
})();
