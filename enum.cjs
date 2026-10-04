// Enumerate ALL leaf elements containing a snippet, with 10-level ancestor chains
// (full layer-trigger props) and effective visibility.
// Usage: node enum.cjs <url> <snippet> [snippet...]
const { chromium } = require('playwright');
const [URL, ...SNIPS] = process.argv.slice(2);

const JS = (snips) => {
  const PROPS = ['willChange', 'transform', 'opacity', 'filter', 'backdropFilter', 'isolation', 'mixBlendMode', 'maskImage', 'webkitMaskImage', 'contain', 'clipPath', 'overflow', 'position'];
  const out = [];
  for (const snip of snips) {
    const s = snip.toLowerCase();
    const hits = [];
    const walk = (e) => {
      if (e.children.length === 0 && (e.textContent || '').toLowerCase().includes(s)) hits.push(e);
      for (const c of e.children) walk(c);
    };
    walk(document.body);
    out.push(`--- "${snip}": ${hits.length} hit(s)`);
    hits.forEach((el, idx) => {
      // effective visibility: product of opacities up the tree
      let op = 1, n = el;
      while (n) { op *= parseFloat(getComputedStyle(n).opacity || '1'); n = n.parentElement; }
      const r = el.getBoundingClientRect();
      out.push(`  [${idx}] p-like <${el.tagName.toLowerCase()}> y${(r.y + scrollY).toFixed(3)} effOp=${op.toFixed(2)}`);
      n = el;
      for (let i = 0; i < 10 && n; i++) {
        const cs = getComputedStyle(n);
        const bits = [];
        for (const p of PROPS) {
          const v = cs[p];
          if (v === undefined) continue;
          const isDefault = (v === 'none' || v === 'auto' || v === '1' || v === 'visible' || v === 'static' || v === 'normal' || v === '0px');
          if (!isDefault) bits.push(p + '=' + String(v).slice(0, 26));
        }
        out.push(`     ${i} <${n.tagName.toLowerCase()}> y${(n.getBoundingClientRect().y + scrollY).toFixed(3)} ${(n.className || '').toString().slice(0, 32)}${bits.length ? ' :: ' + bits.join(' | ') : ''}`);
        n = n.parentElement;
      }
    });
  }
  return out;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2200);
  const out = await page.evaluate(JS, SNIPS);
  console.log('=== ' + URL);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
