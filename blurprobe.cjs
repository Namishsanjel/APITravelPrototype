// Full visibility/opacity probe for the blur-up stack layers.
// Usage: node blurprobe.cjs <url> <selector>
const { chromium } = require('playwright');
const url = process.argv[2];
const sel = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return [`NOT FOUND: ${sel}`];
    const lines = [];
    const stack = [...root.querySelectorAll('*')].filter((e) => {
      const bf = getComputedStyle(e).backdropFilter;
      return bf && bf !== 'none';
    });
    for (const e of stack) {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      let anc = '';
      let p = e.parentElement;
      while (p && p !== root) {
        const ps = getComputedStyle(p);
        if (ps.opacity !== '1' || ps.visibility !== 'visible' || ps.display === 'none' || ps.filter !== 'none') {
          anc += ` [parent ${p.tagName} op=${ps.opacity} vis=${ps.visibility} disp=${ps.display} filter=${ps.filter}]`;
        }
        p = p.parentElement;
      }
      lines.push(
        `y${Math.round(r.y + scrollY)} ${cs.backdropFilter} vis=${cs.visibility} op=${cs.opacity}` +
        ` disp=${cs.display} fill=${cs.backgroundColor} will=${cs.willChange} tf=${cs.transform === 'none' ? '-' : cs.transform.slice(0, 24)}${anc}`
      );
    }
    return lines;
  }, sel);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
