// Dump card/container styles + svg icons per section for faithful porting.
const { chromium } = require('playwright');
const fs = require('fs');

const url = process.argv[2];
const out = process.argv[3];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else res(); };
      s();
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => {
    const secNames = ['header', 'Hero section', 'About us', 'Hikes', "What's included", 'Experience', 'Our guide', "How it's work", 'Testimonial', 'Travel Journal', 'FAQ', 'footer'];
    const sections = [];
    for (const n of secNames) {
      let el = [...document.querySelectorAll('section, footer, header, div')].find(
        (e) => (e.getAttribute('data-framer-name') || '').trim() === n && e.getBoundingClientRect().height > 100
      );
      if (!el && n === 'header') el = document.querySelector('header');
      if (!el) continue;
      const secRect = el.getBoundingClientRect();
      const items = [];
      const all = [el, ...el.querySelectorAll('*')];
      for (const e of all) {
        const cs = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        const bg = cs.backgroundColor;
        const rad = parseFloat(cs.borderRadius) || 0;
        const hasBorder = cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none';
        const hasShadow = cs.boxShadow !== 'none';
        const hasGradient = cs.backgroundImage.includes('gradient');
        const interesting = (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') || rad >= 6 || hasBorder || hasShadow || hasGradient;
        if (!interesting) continue;
        // skip huge full-width wrappers without radius/border/shadow
        items.push({
          t: e.tagName.toLowerCase(),
          n: (e.getAttribute('data-framer-name') || '').slice(0, 40),
          x: Math.round(r.x - secRect.x),
          y: Math.round(r.y + window.scrollY - (secRect.y + window.scrollY)),
          w: Math.round(r.width),
          h: Math.round(r.height),
          bg, rad: cs.borderRadius, bd: hasBorder ? cs.borderTopWidth + ' ' + cs.borderTopColor : '',
          sh: hasShadow ? cs.boxShadow.slice(0, 80) : '',
          op: cs.opacity !== '1' ? cs.opacity : '',
          ov: cs.overflow,
          gi: hasGradient ? cs.backgroundImage.slice(0, 160) : '',
          txt: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
        });
      }
      // svg icons
      const svgs = [...el.querySelectorAll('svg')].map((s) => {
        const r = s.getBoundingClientRect();
        return { x: Math.round(r.x - secRect.x), y: Math.round(r.y + secRect.y), w: Math.round(r.width), h: Math.round(r.height), html: s.outerHTML.slice(0, 900) };
      }).filter((s) => s.w > 8 && s.w < 200);
      sections.push({ name: n, y: Math.round(secRect.y + window.scrollY), h: Math.round(secRect.height), items, svgs });
    }
    return sections;
  });

  fs.writeFileSync(out, JSON.stringify(data, null, 1));
  console.log('sections', data.length, '->', out);
  await browser.close();
})();
