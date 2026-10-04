// List elements whose computed text-wrap differs from 'auto', with text snippets.
// Usage: node balanceprobe.cjs <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const lines = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const style = cs.textWrapStyle;
      if (style && style !== 'auto') {
        const r = el.getBoundingClientRect();
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
        if (!own) continue;
        lines.push(
          `<${el.tagName.toLowerCase()}> wrap=${style} y${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)}` +
          ` cls="${(el.className || '').toString ? el.className.toString().slice(0, 46) : ''}"` +
          ` "${own.slice(0, 54)}"`
        );
      }
    }
    return lines;
  });
  out.forEach((l) => console.log(l));
  console.log(`total: ${out.length}`);
  await browser.close();
})();
