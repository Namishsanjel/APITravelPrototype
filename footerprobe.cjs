// Footer photo + big logo computed styles on the original.
// Usage: node footerprobe.cjs <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const lines = [];
    const foot = document.querySelector('footer');
    if (!foot) return ['no footer'];
    for (const img of foot.querySelectorAll('img')) {
      const r = img.getBoundingClientRect();
      if (r.width < 200) continue;
      const cs = getComputedStyle(img);
      lines.push(`IMG ${img.getAttribute('src') ? img.getAttribute('src').slice(-46) : '(none)'} rect=${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)} nat=${img.naturalWidth}x${img.naturalHeight} fit=${cs.objectFit} op=${cs.opacity} blend=${cs.mixBlendMode} filter=${cs.filter}`);
      let p = img.parentElement, i = 0;
      while (p && i < 3) {
        const ps = getComputedStyle(p);
        lines.push(`  anc${i} op=${ps.opacity} blend=${ps.mixBlendMode} filter=${ps.filter} cls="${(p.className || '').toString().slice(0, 40)}"`);
        p = p.parentElement; i++;
      }
    }
    return lines;
  });
  out.forEach((l) => console.log(l));
  await browser.close();
})();
