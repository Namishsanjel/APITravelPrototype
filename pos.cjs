// Fractional landmark positions for drift hunting.
// Usage: node pos.cjs <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else { window.scrollTo(0, 0); setTimeout(res, 300); } };
      s();
    });
  });
  await page.waitForTimeout(2000);
  const out = await page.evaluate(() => {
    const r2 = (n) => Math.round(n * 100) / 100;
    const lines = [`doc height: ${r2(document.body.scrollHeight)}`];
    const find = (txt, sel = '*') => {
      const els = [...document.querySelectorAll(sel)];
      return els.find((e) => (e.textContent || '').trim() === txt && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
    };
    const rep = (label, el) => {
      if (!el) return lines.push(`${label}: NOT FOUND`);
      const b = el.getBoundingClientRect();
      lines.push(`${label}: top=${r2(b.y + scrollY)} h=${r2(b.height)}`);
    };
    rep('badge "Our hikes"', find('Our hikes'));
    rep('pill "All"', find('All', 'p,span,div'));
    rep('h3 Annapurna', find('Annapurna Base Camp', 'h3'));
    rep('h3 Laugavegur', find('Laugavegur Trail', 'h3'));
    rep('FAQ section', document.querySelector('[data-framer-name="FAQ"], section#faq'));
    rep('FAQ badge', find('FAQ', 'p,span,div'));
    rep('get in touch', document.querySelector('a[href*="contact"] p, a[href="/contact"] span, a[href="/contact"]'));
    rep('footer', document.querySelector('footer'));
    rep('Navigation', find('Navigation', 'p,span,div,h3,h4'));
    rep('CTA h2/heading', find('Your next adventure starts here', 'h2,p,span,div'));
    rep('subline', find('Guided hikes, breathtaking trails, and unforgettable moments—all thoughtfully crafted in one place.', 'p,span,div'));
    const bigLogo = [...document.querySelectorAll('footer img')].find((i) => i.getBoundingClientRect().width >= 250);
    rep('footer big logo', bigLogo);
    return lines;
  });
  out.forEach((l) => console.log(l));
  await browser.close();
})();
