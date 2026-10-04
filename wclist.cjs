// List every element carrying will-change:transform that has visible text: node wclist.cjs <url> <width>
const { chromium } = require('playwright');
const [url, vw = '1440'] = process.argv.slice(2);

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
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const rows = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.willChange !== 'transform') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      // visible text: own text descendants not hidden by opacity on a closer ancestor
      const t = (el.textContent || '').trim().replace(/\s+/g, ' ');
      if (!t) continue;
      // walk up to see if an ancestor hides it
      let hidden = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const c = getComputedStyle(p);
        if (c.opacity === '0' || c.display === 'none' || c.visibility === 'hidden') { hidden = true; break; }
      }
      rows.push({
        y: Math.round(r.y + window.scrollY), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height),
        op: getComputedStyle(el).opacity, hidden,
        cls: (el.getAttribute('class') || '').slice(0, 40),
        txt: t.slice(0, 46),
      });
    }
    return rows;
  });
  console.log(`--- ${vw}px : ${out.length} will-change:text elements`);
  out.forEach((r) => console.log(`${r.hidden ? 'HID ' : '    '}y${r.y} x${r.x} w${r.w} h${r.h} op${r.op} [${r.cls}] "${r.txt}"`));
  await browser.close();
})();
