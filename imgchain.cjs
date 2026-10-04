// Full ancestor style chain for an element matching a substring of its src.
// Usage: node imgchain.cjs <url> <src-substring>
const { chromium } = require('playwright');
const url = process.argv[2];
const sub = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate((sub) => {
    const img = [...document.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').includes(sub));
    if (!img) return [`no img with src ~ ${sub}`];
    const lines = [];
    let e = img;
    for (let i = 0; e; i++, e = e.parentElement) {
      const cs = getComputedStyle(e);
      const bits = [];
      if (cs.opacity !== '1') bits.push(`OP=${cs.opacity}`);
      if (cs.filter !== 'none') bits.push(`filter=${cs.filter}`);
      if (cs.mixBlendMode !== 'normal') bits.push(`blend=${cs.mixBlendMode}`);
      if (cs.maskImage !== 'none') bits.push(`mask=${cs.maskImage.slice(0, 80)} size=${cs.maskSize} pos=${cs.maskPosition} rep=${cs.maskRepeat}`);
      if (cs.clipPath !== 'none') bits.push(`clip=${cs.clipPath.slice(0, 60)}`);
      if (cs.backgroundImage !== 'none') bits.push(`bgi=${cs.backgroundImage.slice(0, 60)}`);
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bits.push(`bgc=${cs.backgroundColor}`);
      if (cs.contentVisibility) bits.push(`csv=${cs.contentVisibility}`);
      if (cs.willChange !== 'auto') bits.push(`wc=${cs.willChange}`);
      const r = e.getBoundingClientRect();
      lines.push(
        `${'  '.repeat(i)}<${e.tagName.toLowerCase()}> y${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)}` +
        (bits.length ? ' ' + bits.join(' ') : '') + ` cls="${(e.className || '').toString().slice(0, 34)}"`
      );
    }
    return lines;
  }, sub);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
