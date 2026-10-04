// Elements overlapping the footer top band (y3913..4070) with background-ish styles.
// Usage: node footertop.cjs <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  const out = await page.evaluate(() => {
    const lines = [];
    const walk = (el, d) => {
      const r = el.getBoundingClientRect();
      const top = r.y + scrollY, bottom = top + r.height;
      if (r.width > 400 && bottom > 3913 && top < 4075) {
        const cs = getComputedStyle(el);
        lines.push(
          `${'  '.repeat(d)}<${el.tagName.toLowerCase()}> y${Math.round(top)},${Math.round(r.width)}x${Math.round(r.height)}` +
          ` bgc=${cs.backgroundColor} bgi=${cs.backgroundImage === 'none' ? '-' : cs.backgroundImage.slice(0, 90)}` +
          ` mask=${cs.maskImage === 'none' ? '-' : cs.maskImage.slice(0, 70)} op=${cs.opacity} blend=${cs.mixBlendMode}` +
          ` grad=${cs.backgroundAttachment} size=${cs.backgroundSize} pos=${cs.backgroundPosition}` +
          ` cls="${(el.className || '').toString().slice(0, 36)}"`
        );
      }
      for (const c of el.children) walk(c, d + 1);
    };
    walk(document.body, 0);
    return lines;
  });
  out.forEach((l) => console.log(l));
  await browser.close();
})();
