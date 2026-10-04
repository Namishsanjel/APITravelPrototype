// Dump elements in a y-range with computed style: node yprobe.cjs <url> <y0> <y1> [selector] [width]
const { chromium } = require('playwright');
const [url, y0, y1, sel = 'img,a,p,div,span,h1,h2,h3,h4,h5', vw = '1440'] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(vw), height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 60); else { window.scrollTo(0, 0); setTimeout(res, 400); } };
      s();
    });
  });
  await page.waitForTimeout(2000);
  const out = await page.evaluate(
    ({ y0, y1, sel }) => {
      const rows = [];
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        const y = r.y + window.scrollY;
        if (y + r.height < Number(y0) || y > Number(y1)) continue;
        if (r.width < 8 || r.height < 8) continue;
        const cs = getComputedStyle(el);
        const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        rows.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') || '').slice(0, 70),
          frm: (el.getAttribute('data-framer-name') || '').slice(0, 30),
          x: Math.round(r.x), y: Math.round(y), w: Math.round(r.width), h: Math.round(r.height),
          op: cs.opacity, fit: cs.objectFit, pos: cs.objectPosition, src: (el.currentSrc || '').split('/').pop().slice(0, 40),
          txt: direct ? (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40) : '',
        });
      }
      return rows;
    },
    { y0: Number(y0), y1: Number(y1), sel }
  );
  out.forEach((r) => console.log(JSON.stringify(r)));
  await browser.close();
})();
