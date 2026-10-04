const { chromium } = require('playwright');
const URLS = [
  'http://localhost:8091/trova-travel.framer.website/contact.html',
  'http://localhost:5174/contact',
];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const u of URLS) {
    await page.goto(u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 50); else { window.scrollTo(0, 0); setTimeout(res, 400); } };
        s();
      });
    });
    await page.waitForTimeout(1200);
    const o = await page.evaluate(async () => {
      await document.fonts.ready;
      const out = [];
      const seen = new Set();
      for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,p,span,a,button,div,li')) {
        const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!direct) continue;
        const cs = getComputedStyle(el);
        const key = `${el.tagName}|${cs.fontFamily}|${cs.fontSize}|${cs.fontWeight}|${cs.fontVariationSettings}|${cs.letterSpacing}|${cs.textWrapStyle}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const r = el.getBoundingClientRect();
        if (r.height < 6) continue;
        out.push({
          tag: el.tagName,
          t: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26),
          y: Math.round(r.y + scrollY),
          ff: cs.fontFamily.slice(0, 26),
          fs: cs.fontSize,
          fw: cs.fontWeight,
          fv: cs.fontVariationSettings,
          ls: cs.letterSpacing,
          tw: cs.textWrapStyle,
        });
      }
      return out;
    });
    console.log('=== ' + u);
    o.forEach((x) => console.log(JSON.stringify(x)));
  }
  await browser.close();
})();
