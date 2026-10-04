// Footer-internal fractional positions for drift hunting.
// Usage: node posfoot.cjs <url>
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
    const lines = [];
    const foot = document.querySelector('footer');
    if (!foot) return ['no footer'];
    const fr = foot.getBoundingClientRect();
    lines.push(`footer top=${r2(fr.y + scrollY)} h=${r2(fr.height)}`);
    const rep = (label, el) => {
      if (!el) return lines.push(`${label}: NOT FOUND`);
      const b = el.getBoundingClientRect();
      lines.push(`${label}: top=${r2(b.y + scrollY)} h=${r2(b.height)} x=${r2(b.x)} w=${r2(b.width)}`);
    };
    rep('h2 (CTA heading)', foot.querySelector('h1,h2,h3,h4,h5'));
    const p = [...foot.querySelectorAll('p')];
    rep('CTA sub (p #1)', p.find((e) => (e.textContent || '').includes('Explore remote landscapes')));
    rep('subline p', p.find((e) => (e.textContent || '').includes('thoughtfully crafted')));
    const a = [...foot.querySelectorAll('a')];
    rep('CTA button', a.find((e) => (e.textContent || '').includes('Explore Hikes')));
    rep('first sitemap link', a.find((e) => (e.textContent || '').trim() === 'Home'));
    rep('Navigation label', p.find((e) => (e.textContent || '').trim() === 'Navigation'));
    rep('logo link', a.find((e) => e.querySelector('img') && e.getBoundingClientRect().y < fr.y + 800 && e.getBoundingClientRect().width > 80));
    rep('big logo img', [...foot.querySelectorAll('img')].find((i) => r2(i.getBoundingClientRect().x) > 400));
    // wrappers with padding: Footer Content / CTA & footer
    for (const d of foot.querySelectorAll('div')) {
      const cs = getComputedStyle(d);
      if (cs.paddingTop !== '0px' && d.getBoundingClientRect().height > 50) {
        const b = d.getBoundingClientRect();
        lines.push(`div[pad ${cs.paddingTop}/${cs.paddingBottom}, gap ${cs.gap}]: top=${r2(b.y + scrollY)} h=${r2(b.height)}`);
      }
    }
    return lines;
  });
  out.forEach((l) => console.log(l));
  await browser.close();
})();
