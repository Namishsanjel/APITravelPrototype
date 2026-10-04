const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:8091/trova-travel.framer.website/contact.html', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const o = await p.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Open menu"]');
    const r = nav.getBoundingClientRect();
    const cs = getComputedStyle(nav);
    const out = {
      nav: { x: r.x, y: r.y, w: r.width, h: r.height, display: cs.display, gap: cs.gap, align: cs.alignItems, justify: cs.justifyContent, dir: cs.flexDirection, pad: cs.padding, br: cs.borderRadius, cursor: cs.cursor },
      bars: [...nav.children].map((e) => {
        const q = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return { x: q.x, y: q.y, w: q.width, h: q.height, bg: s.backgroundColor, br: s.borderRadius };
      }),
    };
    return out;
  });
  console.log(JSON.stringify(o, null, 1));
  await b.close();
})();
