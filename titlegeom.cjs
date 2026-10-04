// Precise geometry of the card title + ancestors on orig and port.
// Usage: node titlegeom.cjs
const { chromium } = require('playwright');
const SUB = 'Annapurna Base Camp';
const JS = (sub) => {
  const walk = (el) => {
    for (const c of el.children) {
      const h = walk(c);
      if (h) return h;
    }
    if (el.children.length === 0 && (el.textContent || '').includes(sub)) return el;
    return null;
  };
  const h3 = walk(document.body);
  const range = document.createRange();
  range.selectNodeContents(h3);
  const rr = range.getBoundingClientRect();
  const chain = [];
  let n = h3;
  for (let i = 0; i < 6 && n; i++) {
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    chain.push({
      tag: n.tagName.toLowerCase(),
      y: +r.y.toFixed(3),
      h: +r.height.toFixed(3),
      x: +r.x.toFixed(3),
      w: +r.width.toFixed(3),
      pos: cs.position,
      lh: cs.lineHeight,
      fs: cs.fontSize,
      transform: cs.transform,
      display: cs.display,
      cls: (n.className || '').toString ? n.className.toString().slice(0, 40) : '',
    });
    n = n.parentElement;
  }
  const cs = getComputedStyle(h3);
  return {
    rangeRect: `y${rr.y.toFixed(3)} h${rr.height.toFixed(3)} x${rr.x.toFixed(3)} w${rr.width.toFixed(3)}`,
    h3: { lh: cs.lineHeight, fs: cs.fontSize, pad: cs.padding, pos: cs.position, top: cs.top, transform: cs.transform, mt: cs.marginTop },
    scrollY: window.scrollY,
    chain,
  };
};
(async () => {
  const { chromium: cr } = require('playwright');
  const browser = await cr.launch();
  for (const url of ['http://localhost:8091/trova-travel.framer.website/hikes.html', 'http://localhost:5173/hikes']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const out = await page.evaluate(JS, SUB);
    console.log('=== ' + url);
    console.log('range:', out.rangeRect, '| scrollY:', out.scrollY);
    console.log('h3 cs:', JSON.stringify(out.h3));
    out.chain.forEach((c) => console.log('  ' + JSON.stringify(c)));
    await page.close();
  }
  await browser.close();
})();
