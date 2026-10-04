// Dump header + footer structure with correct relative coords.
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
    const dump = (root) => {
      const base = root.getBoundingClientRect();
      const items = [];
      const walk = (el, depth) => {
        const r = el.getBoundingClientRect();
        if (r.width > 2 && r.height > 2) {
          const cs = getComputedStyle(el);
          items.push({
            d: depth,
            t: el.tagName.toLowerCase(),
            n: (el.getAttribute('data-framer-name') || '').slice(0, 30),
            x: Math.round(r.x - base.x),
            y: Math.round(r.y - base.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
            bg: cs.backgroundColor,
            rad: cs.borderRadius,
            pos: cs.position,
            txt: [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ').slice(0, 45),
          });
        }
        for (const c of el.children) walk(c, depth + 1);
      };
      walk(root, 0);
      return items;
    };
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    return {
      header: header ? { y: Math.round(header.getBoundingClientRect().y + window.scrollY), items: dump(header) } : null,
      footer: footer ? { y: Math.round(footer.getBoundingClientRect().y + window.scrollY), items: dump(footer) } : null,
    };
  });
  fs.writeFileSync(out, JSON.stringify(data, null, 1));
  console.log('header items', data.header && data.header.items.length, 'footer items', data.footer && data.footer.items.length);
  await browser.close();
})();
