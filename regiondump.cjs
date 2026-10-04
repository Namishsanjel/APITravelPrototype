// Dump every element with a rect overlapping a y-range (default 4380-4460),
// showing tag, text, effOp, and layer-trigger props up 6 levels.
// Usage: node regiondump.cjs <url> <y0> <y1>
const { chromium } = require('playwright');
const [URL, Y0, Y1] = process.argv.slice(2);

const JS = ({ y0, y1 }) => {
  const out = [];
  const walk = (e) => {
    const r = e.getBoundingClientRect();
    const y = r.y + scrollY, b = y + r.height;
    if (b > y0 && y < y1 && r.width > 0 && r.height > 0) {
      let op = 1, n = e;
      while (n) { op *= parseFloat(getComputedStyle(n).opacity || '1'); n = n.parentElement; }
      const bits = [];
      n = e;
      for (let i = 0; i < 6 && n; i++) {
        const cs = getComputedStyle(n);
        const pbits = [];
        if (cs.willChange !== 'auto') pbits.push('wc=' + cs.willChange);
        if (cs.transform !== 'none') pbits.push('tf');
        if (cs.opacity !== '1') pbits.push('op=' + cs.opacity);
        if (cs.overflow !== 'visible') pbits.push('ov=' + cs.overflow);
        if (pbits.length) bits.push(`${i}:${n.tagName.toLowerCase()}[${pbits.join(',')}]`);
        n = n.parentElement;
      }
      out.push(`<${e.tagName.toLowerCase()}> y${y.toFixed(2)} ${r.width.toFixed(1)}x${r.height.toFixed(1)} op=${op.toFixed(2)} txt="${(e.textContent || '').trim().slice(0, 30)}" :: ${bits.join(' < ')}`);
    }
    for (const c of e.children) walk(c);
  };
  walk(document.body);
  return out;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2200);
  const out = await page.evaluate(JS, { y0: +Y0, y1: +Y1 });
  console.log('=== ' + URL);
  out.forEach((l) => console.log('  ' + l));
  await browser.close();
})();
