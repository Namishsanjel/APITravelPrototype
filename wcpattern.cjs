// For several known text snippets: nearest ancestor with will-change/transform,
// element opacity, and -webkit-font-smoothing. Usage: node wcpattern.cjs <url>
const { chromium } = require('playwright');
const url = process.argv[2];
const SNIPS = [
  'Find',
  'From peaceful forest walks',
  'Good to know',
  'If you can walk',
  'Explore remote landscapes',
  'Annapurna Base Camp',
  'Guided hikes, breathtaking',
  '2026 API Touch',
  'Navigation',
  'Adventure',
  'View trip',
  'Explore all hikes',
];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate((snips) => {
    const find = (root, s) => {
      const walk = (el) => {
        for (const c of el.children) {
          const h = walk(c);
          if (h) return h;
        }
        if (el.children.length === 0 && (el.textContent || '').includes(s)) return el;
        return null;
      };
      return walk(root);
    };
    return snips.map((s) => {
      let el = null;
      try {
        el = find(document.body, s);
      } catch (e) {}
      if (!el) return `${s}: NOT FOUND`;
      const cs = getComputedStyle(el);
      let wc = null, tf = null, opEl = null;
      let n = el.parentElement;
      for (let i = 0; i < 4 && n; i++) {
        const c = getComputedStyle(n);
        if (!wc && c.willChange !== 'auto') wc = `L${i}:${c.willChange}`;
        if (!tf && c.transform !== 'none') tf = `L${i}:${c.transform}`;
        if (!opEl && c.opacity !== '1') opEl = `L${i}:${c.opacity}`;
        n = n.parentElement;
      }
      // count matching elements (twins?)
      let count = 0;
      const all = document.querySelectorAll('*');
      for (const e of all) if ((e.textContent || '').includes(s) && e.children.length === 0) count++;
      return `${s}: smooth=${cs.webkitFontSmoothing} wc=${wc || '-'} tf=${tf || '-'} op=${opEl || '-'} twins=${count}`;
    });
  }, SNIPS);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
