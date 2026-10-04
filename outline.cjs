// Structural overview of a page: document height, then every top-level-ish
// section landmark (h1/h2/h3, eyebrow text, key rects) in document order.
// Usage: node outline.cjs <url>
const { chromium } = require('playwright');
const [URL] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const lines = [];
    lines.push('doc=' + document.documentElement.scrollHeight);
    const info = (e) => {
      const r = e.getBoundingClientRect();
      return `y${(r.y + scrollY).toFixed(1)} x${r.x.toFixed(1)} ${r.width.toFixed(0)}x${r.height.toFixed(0)}`;
    };
    // headings
    document.querySelectorAll('h1,h2,h3').forEach((e) => {
      const t = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 56);
      lines.push(`<${e.tagName.toLowerCase()}> ${info(e)} "${t}"`);
    });
    // standalone eyebrow-ish leaves (small text right under section tops)
    const leaves = [];
    const walk = (e, d) => {
      if (e.children.length === 0) {
        const t = (e.textContent || '').trim().replace(/\s+/g, ' ');
        if (t && t.length < 40 && e.getBoundingClientRect().height > 0) leaves.push({ t, e, d });
      }
      for (const c of e.children) walk(c, d + 1);
    };
    walk(document.body, 0);
    lines.push('--- small leaves (first 40):');
    leaves.slice(0, 40).forEach(({ t, e }) => lines.push(`  ${info(e)} "${t}"`));
    // images
    lines.push('--- imgs:');
    [...document.querySelectorAll('img')].slice(0, 24).forEach((i) => {
      lines.push(`  ${info(i)} natural=${i.naturalWidth}x${i.naturalHeight} alt="${(i.alt || '').slice(0, 24)}" src=...${i.src.slice(-46)}`);
    });
    // sections count
    lines.push('--- counts: ' + JSON.stringify({
      sections: document.querySelectorAll('section').length,
      divs: document.querySelectorAll('div').length,
      imgs: document.querySelectorAll('img').length,
      links: document.querySelectorAll('a').length,
      forms: document.querySelectorAll('input,textarea,select,button').length,
    }));
    return lines;
  });
  console.log('=== ' + URL);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
