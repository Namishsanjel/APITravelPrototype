// Full content dump: every text leaf with rect (doc order), every img with full
// src + rect, every link with href + rect.
// Usage: node pagedump.cjs <url> [yMax]
const { chromium } = require('playwright');
const [URL, YMAX] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // scroll through so lazy content/images resolve, then back to top
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += 700;
        if (y < document.body.scrollHeight) setTimeout(step, 50);
        else { window.scrollTo(0, 0); setTimeout(res, 300); }
      };
      step();
    });
  });
  await page.waitForTimeout(800);
  const out = await page.evaluate((ymax) => {
    const lines = [];
    const info = (e) => {
      const r = e.getBoundingClientRect();
      return `y${(r.y + scrollY).toFixed(1)} x${r.x.toFixed(1)} ${r.width.toFixed(1)}x${r.height.toFixed(1)}`;
    };
    const YM = ymax ? +ymax : 1e9;
    lines.push('--- TEXT LEAVES');
    const walk = (e) => {
      if (e.children.length === 0) {
        const t = (e.textContent || '').replace(/\s+/g, ' ').trim();
        const r = e.getBoundingClientRect();
        if (t && r.height > 0 && r.y + scrollY < YM) {
          const cls = (e.className || '').toString().split(' ')[0] || e.tagName.toLowerCase();
          lines.push(`  ${info(e)} [${cls}] ${t.length > 700 ? t.slice(0, 700) + '…' : t}`);
        }
      }
      for (const c of e.children) walk(c);
    };
    walk(document.body);
    lines.push('--- IMAGES');
    [...document.querySelectorAll('img')].forEach((i) => {
      const r = i.getBoundingClientRect();
      if (r.y + scrollY < YM) lines.push(`  ${info(i)} nat=${i.naturalWidth}x${i.naturalHeight} ${i.src}`);
    });
    lines.push('--- LINKS');
    [...document.querySelectorAll('a')].forEach((a) => {
      const r = a.getBoundingClientRect();
      if (r.y + scrollY < YM) lines.push(`  ${info(a)} href=${a.getAttribute('href')} "${(a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)}"`);
    });
    return lines;
  }, YMAX || '');
  console.log('=== ' + URL);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
