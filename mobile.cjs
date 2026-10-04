// Mobile (390) layout probe: nav, cards, sections, body height.
// Usage: node mobile.cjs <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 500; if (y < document.body.scrollHeight) setTimeout(s, 40); else { window.scrollTo(0, 0); setTimeout(res, 300); } };
      s();
    });
  });
  await page.waitForTimeout(2500);
  const rows = await page.evaluate(() => {
    const out = [`body: ${document.documentElement.scrollWidth}x${document.body.scrollHeight} title="${document.title}"`];
    const push = (label, el) => {
      if (!el) return out.push(`${label}: NOT FOUND`);
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.push(`${label}: x${Math.round(r.x)},y${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)} pos=${cs.position}`);
    };
    push('header', document.querySelector('header'));
    for (const a of document.querySelectorAll('header a')) out.push(`  nav a "${(a.textContent || '').trim().slice(0, 24)}" ${Math.round(a.getBoundingClientRect().width)}x${Math.round(a.getBoundingClientRect().height)}`);
    push('main', document.querySelector('main'));
    push('section', document.querySelector('main section'));
    const cards = [...document.querySelectorAll('[data-framer-name="Desktop"]')].filter((e) => e.querySelector('[data-framer-name="Image wrap"]'));
    out.push(`cards: ${cards.length}`);
    cards.slice(0, 4).forEach((c) => { const r = c.getBoundingClientRect(); out.push(`  card ${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)}`); });
    const faq = document.querySelector('[data-framer-name="FAQ"]');
    push('FAQ', faq);
    if (faq) {
      const left = faq.querySelector('[data-framer-name="Left content"]');
      const cont = faq.querySelector('[data-framer-name="FAQ Container"]');
      push('  faq left', left);
      push('  faq cards', cont);
      if (cont) [...cont.children].forEach((c, i) => { const r = c.getBoundingClientRect(); out.push(`    card${i}: y${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)}`); });
    }
    push('footer', document.querySelector('footer'));
    // any hamburger / menu button?
    for (const el of document.querySelectorAll('header *')) {
      const cs = getComputedStyle(el);
      if (cs.cursor === 'pointer' && !el.textContent.trim()) out.push(`  header hit-target: ${el.tagName}[${el.getAttribute('data-framer-name') || ''}] ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
    }
    return out;
  });
  rows.forEach((r) => console.log(r));
  await browser.close();
})();
