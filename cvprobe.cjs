// Why are journal row2/3 cards blank in the ref capture?
const { chromium } = require('playwright');
const URL = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += 600;
        if (y < document.body.scrollHeight) setTimeout(step, 60);
        else { window.scrollTo(0, 0); setTimeout(res, 400); }
      };
      step();
    });
  });
  await page.waitForTimeout(1500);
  const out = await page.evaluate(() => {
    const find = (t) => [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && (e.textContent || '').trim().includes(t));
    const rep = (label, el) => {
      if (!el) return label + ': NOT FOUND';
      const chain = [];
      let n = el;
      for (let i = 0; i < 8 && n && n !== document.documentElement; i++, n = n.parentElement) {
        const cs = getComputedStyle(n);
        const b = n.getBoundingClientRect();
        chain.push({
          tag: n.tagName.toLowerCase() + '.' + String(n.className).split(' ').slice(0, 2).join('.'),
          cv: cs.contentVisibility, op: cs.opacity, vis: cs.visibility, disp: cs.display,
          y: +(b.y + scrollY).toFixed(1), h: +b.height.toFixed(1),
        });
      }
      return { label, chain };
    };
    const r2title = find('What actually goes in your pack');
    const r1title = find('Why the same route feels');
    const mid = r2title ? r2title.getBoundingClientRect() : null;
    let paint = null;
    if (mid) {
      const px = mid.x + mid.width / 2;
      const py = mid.y + scrollY + mid.height / 2;
      const el = document.elementFromPoint(px, py - scrollY);
      paint = el ? el.tagName.toLowerCase() + '.' + String(el.className).split(' ').slice(0, 3).join('.') : null;
      paint += ' @doc(' + px.toFixed(0) + ',' + py.toFixed(0) + ')';
    }
    return {
      r1: rep('row1', r1title),
      r2: rep('row2', r2title),
      r2visible: r2title ? JSON.stringify(r2title.getBoundingClientRect()) : null,
      paint,
      hasCV: [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).contentVisibility !== 'visible').length,
      cvSample: [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).contentVisibility !== 'visible').slice(0, 5).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ':' + getComputedStyle(e).contentVisibility),
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
