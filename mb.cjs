const { chromium } = require('playwright');
const U = [
  'http://localhost:8091/trova-travel.framer.website/contact.html',
  'http://localhost:5174/contact',
];
(async () => {
  const b = await chromium.launch();
  for (const u of U) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    await p.goto(u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(2000);
    const o = await p.evaluate(() => {
      const out = {};
      const cta = [...document.querySelectorAll('h2,span,div,p')].filter((e) => {
        const r = e.getBoundingClientRect();
        const y = r.y + scrollY;
        return y > 2400 && y < 2600 && r.height > 40 && r.width > 100;
      });
      out.cta = cta.slice(0, 8).map((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return `${e.tagName}.${(e.className || '').toString().slice(0, 18)} ${Math.round(r.x)},${Math.round(r.y + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)} fs=${cs.fontSize} lh=${cs.lineHeight}`;
      });
      out.h5 = [...document.querySelectorAll('h5')].map((e) => {
        const r = e.getBoundingClientRect();
        return `${Math.round(r.y + scrollY)}/${Math.round(r.height)}`;
      });
      out.sect = [...document.querySelectorAll('section,footer')].map((e) => {
        const r = e.getBoundingClientRect();
        return `${e.id || e.tagName}:${Math.round(r.y + scrollY)}-${Math.round(r.height)}`;
      });
      const items = [...document.querySelectorAll('#faq [class*=rounded-lg], #faq > div > div:last-child > div')].slice(0, 8);
      out.items = items.map((e) => {
        const r = e.getBoundingClientRect();
        return `${Math.round(r.y + scrollY)}-${Math.round(r.height)}`;
      });
      return out;
    });
    console.log('=== ' + u);
    console.log(JSON.stringify(o, null, 1));
    await p.close();
  }
  await b.close();
})();
