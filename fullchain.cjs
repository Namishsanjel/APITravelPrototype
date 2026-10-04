// Full layer-trigger property dump along ancestor chains of button texts.
// Usage: node fullchain.cjs <url1> [url2]
// Targets: nav button (y36.5), card button (y846.9), CTA button (y4395+).
const { chromium } = require('playwright');

const PROPS = [
  'willChange', 'transform', 'filter', 'backdropFilter', 'opacity', 'isolation',
  'mixBlendMode', 'maskImage', 'webkitMaskImage', 'perspective', 'contain',
  'contentVisibility', 'backfaceVisibility', 'containerType', 'clipPath',
  'overflow', 'overflowClipMargin', 'position', 'zIndex', 'scrollBehavior',
];

const JS = (PROPS) => {
  const findAt = (yTarget) => {
    let best = null, bestD = 1e9;
    const walk = (e) => {
      if (e.children.length === 0) {
        const r = e.getBoundingClientRect();
        const y = r.y + scrollY;
        const d = Math.abs(y - yTarget);
        const t = (e.textContent || '').trim();
        if (t && d < bestD && d < 40) { bestD = d; best = e; }
      }
      for (const c of e.children) walk(c);
    };
    walk(document.body);
    return best;
  };
  const targets = [
    ['nav-btn@36.5', 36.5],
    ['card-btn@846.9', 846.9],
    ['cta-btn@4395', 4405],
  ];
  const out = [];
  for (const [label, y] of targets) {
    const el = findAt(y);
    if (!el) { out.push(label + ': NOT FOUND'); continue; }
    const lines = [`${label} text="${(el.textContent || '').trim().slice(0, 24)}"`];
    let n = el;
    for (let i = 0; i < 6 && n; i++) {
      const cs = getComputedStyle(n);
      const bits = [];
      for (const p of PROPS) {
        const v = cs[p];
        if (v === undefined) continue;
        const def = (p === 'transform' || p === 'filter' || p === 'backdropFilter' || p === 'perspective' || p === 'maskImage' || p === 'webkitMaskImage' || p === 'clipPath') ? 'none'
          : p === 'opacity' ? '1'
          : p === 'overflow' ? 'visible'
          : p === 'position' ? 'static'
          : p === 'zIndex' ? 'auto'
          : p === 'willChange' ? 'auto'
          : p === 'isolation' ? 'auto'
          : p === 'mixBlendMode' ? 'normal'
          : p === 'contain' ? 'none'
          : p === 'contentVisibility' ? 'visible'
          : p === 'backfaceVisibility' ? 'visible'
          : p === 'containerType' ? 'normal'
          : p === 'overflowClipMargin' ? '0px'
          : p === 'scrollBehavior' ? 'auto'
          : null;
        if (v && v !== 'none' && v !== def) bits.push(p + '=' + String(v).slice(0, 30));
      }
      lines.push('  ' + i + ' <' + n.tagName.toLowerCase() + '> y' + (n.getBoundingClientRect().y + scrollY).toFixed(3) + ' ' + (n.className || '').toString().slice(0, 30) + (bits.length ? ' :: ' + bits.join(' | ') : ''));
      n = n.parentElement;
    }
    out.push(lines.join('\n'));
  }
  return out;
};

(async () => {
  const browser = await chromium.launch();
  for (const url of process.argv.slice(2)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2200);
    const out = await page.evaluate(JS, PROPS);
    console.log('=== ' + url);
    out.forEach((o) => console.log(o));
    await page.close();
  }
  await browser.close();
})();
