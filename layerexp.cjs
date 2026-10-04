// 1) Layer-forcing props along the subline's ancestor chain (orig vs port).
// 2) PORT experiment: force composited layer (will-change) on ancestors,
//    re-measure fringe stats + mad vs orig-on baseline.
// Usage: node layerexp.cjs
const { chromium } = require('playwright');
const fs = require('fs');

const ORIG = 'http://localhost:8091/trova-travel.framer.website/hikes.html';
const PORT = 'http://localhost:5173/hikes';
const SUB = 'Guided hikes, breathtaking';

const CHAIN_JS = (sub) => {
  const walk = (el) => {
    for (const c of el.children) {
      const h = walk(c);
      if (h) return h;
    }
    if (el.children.length === 0 && (el.textContent || '').includes(sub)) return el;
    return null;
  };
  const el = walk(document.body);
  const out = [];
  let n = el;
  while (n && n !== document.documentElement) {
    const cs = getComputedStyle(n);
    const bits = [];
    if (cs.transform !== 'none') bits.push(`transform=${cs.transform}`);
    if (cs.willChange !== 'auto') bits.push(`willChange=${cs.willChange}`);
    if (cs.filter !== 'none') bits.push(`filter=${cs.filter}`);
    if (cs.backdropFilter && cs.backdropFilter !== 'none') bits.push(`backdrop=${cs.backdropFilter}`);
    if (cs.contain && cs.contain !== 'none') bits.push(`contain=${cs.contain}`);
    if (cs.isolation !== 'auto') bits.push(`isolation=${cs.isolation}`);
    if (cs.mixBlendMode !== 'normal') bits.push(`blend=${cs.mixBlendMode}`);
    if (cs.maskImage && cs.maskImage !== 'none') bits.push(`mask=${cs.maskImage.slice(0, 48)}`);
    if (cs.opacity !== '1') bits.push(`op=${cs.opacity}`);
    if (cs.perspective !== 'none') bits.push(`persp=${cs.perspective}`);
    if (cs.containerType && cs.containerType !== 'normal') bits.push(`container=${cs.containerType}`);
    if (cs.contentVisibility !== 'visible') bits.push(`contentVis=${cs.contentVisibility}`);
    if (cs.backfaceVisibility === 'hidden') bits.push('backface=hidden');
    if (cs.zoom !== '1') bits.push(`zoom=${cs.zoom}`);
    out.push(
      `<${n.tagName.toLowerCase()}> y${Math.round(n.getBoundingClientRect().y + scrollY)}` +
      ` cls="${(n.className || '').toString ? n.className.toString().slice(0, 34) : ''}"` +
      (bits.length ? ' :: ' + bits.join(' ') : '')
    );
    n = n.parentElement;
  }
  return out;
};

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
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  fs.writeFileSync(file, await el.screenshot({ type: 'png' }));
}

(async () => {
  const browser = await chromium.launch();

  // --- chains
  for (const url of [ORIG, PORT]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const chain = await page.evaluate(CHAIN_JS, SUB);
    console.log(`=== chain ${url}`);
    chain.forEach((c) => console.log('  ' + c));
    await page.close();
  }

  // --- port experiments
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(PORT, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const experiments = [
    ['layer-p', () => { const el = window.__p; }],
  ];

  // E0 baseline
  await shotSubline(page, 'shots/lay-port-base.png');

  // E1: will-change on the p
  await page.evaluate((sub) => {
    const walk = (el) => {
      for (const c of el.children) { const h = walk(c); if (h) return h; }
      if (el.children.length === 0 && (el.textContent || '').includes(sub)) return el;
      return null;
    };
    window.__sub = walk(document.body);
    window.__sub.style.willChange = 'transform';
  }, SUB);
  await page.waitForTimeout(600);
  await shotSubline(page, 'shots/lay-port-wc.png');

  // E2: transform translateZ on the p
  await page.evaluate(() => {
    window.__sub.style.willChange = 'auto';
    window.__sub.style.transform = 'translateZ(0)';
  });
  await page.waitForTimeout(600);
  await shotSubline(page, 'shots/lay-port-tz.png');

  // E3: transform on a footer ancestor instead (content wrapper)
  await page.evaluate(() => {
    window.__sub.style.transform = 'none';
    const footer = document.querySelector('footer');
    footer.style.transform = 'translateZ(0)';
    window.__footer = footer;
  });
  await page.waitForTimeout(600);
  await shotSubline(page, 'shots/lay-port-foot.png');
  await page.close();

  // --- stats for all shots (+ mad vs orig-on)
  const files = [
    'shots/mask-orig-on.png',
    'shots/lay-port-base.png',
    'shots/lay-port-wc.png',
    'shots/lay-port-tz.png',
    'shots/lay-port-foot.png',
  ];
  const page3 = await browser.newPage();
  const bufs = files.map((f) => fs.readFileSync(f).toString('base64'));
  const res = await page3.evaluate(async (bufs) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
    const imgs = await Promise.all(bufs.map(load));
    const data = imgs.map((img) => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, c.width, c.height).data;
    });
    const stat = (d) => {
      let n = 0, fringe = 0, sum = 0;
      for (let i = 0; i < d.length; i += 4) {
        const R = d[i], G = d[i + 1], B = d[i + 2];
        const lum = 0.299 * R + 0.587 * G + 0.114 * B;
        if (lum > 150) {
          n++;
          if (Math.max(R, G, B) - Math.min(R, G, B) > 30) fringe++;
        }
        sum += Math.abs(R - 0) ;
      }
      return { n, fringePct: ((fringe / n) * 100).toFixed(1) };
    };
    const mad = (a, b) => {
      let s = 0;
      for (let i = 0; i < a.length; i += 4) s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
      return (s / (a.length / 4) / 3).toFixed(3);
    };
    return data.map((d, i) => ({ i, ...stat(d), madVsOrig: i === 0 ? '-' : mad(data[0], d) }));
  }, bufs);
  res.forEach((r) => console.log(`${files[r.i]}: bright=${r.n} fringe%=${r.fringePct} madVsOrigOn=${r.madVsOrig}`));
  await browser.close();
})();
