// Find horizontal overflow culprits at a viewport width.
const { chromium } = require('playwright');
const [url, width = '390'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(width), height: 844 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 500; if (y < document.body.scrollHeight) setTimeout(s, 50); else { window.scrollTo(0, 0); setTimeout(res, 400); } };
      s();
    });
  });
  await page.waitForTimeout(1000);
  const o = await page.evaluate((width) => {
    const W = Number(width);
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const right = r.x + r.width;
      if (right > W + 1 || r.x < -1) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' && r.width <= W) continue;
        out.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 46),
          x: Math.round(r.x),
          y: Math.round(r.y + scrollY),
          w: Math.round(r.width),
          h: Math.round(r.height),
          right: Math.round(right),
          pos: cs.position,
          txt: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24),
        });
      }
    }
    out.sort((a, b) => b.right - a.right);
    return {
      docW: document.documentElement.scrollWidth,
      bodyW: document.body.scrollWidth,
      docH: document.documentElement.scrollHeight,
      n: out.length,
      top: out.slice(0, 30),
    };
  }, width);
  console.log(JSON.stringify(o, null, 1));
  await browser.close();
})();
