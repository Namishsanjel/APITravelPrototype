// Computed text-wrap for a set of representative text elements, ref vs port.
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2);
const SAMPLES = [
  ['h1', 'Where Every Journey'],
  ['p', 'Meet the passionate explorers'],
  ['h2', 'What sets every'],
  ['p', 'Thoughtfully crafted experiences'],
  ['h4', 'API Touch began with a handful'],
  ['h4', 'What started as informal weekend'],
  ['h4', 'Local guides, not scripts'],
  ['p', 'Every route led by someone'],
  ['h4', 'Maren K.'],
  ['span', 'lead guide'],
  ['h3', 'Frequently'],
  ['p', 'Usually 6 to 8'],
  ['p', 'From hidden viewpoints'],
];
const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  return page.evaluate((samples) => {
    const out = [];
    for (const [tag, prefix] of samples) {
      const el = [...document.querySelectorAll(tag + ', div, span')].find(
        (e) => e.children.length === 0 && (e.textContent || '').trim().startsWith(prefix)
      );
      if (!el) { out.push(prefix.slice(0, 25) + ' => NOT FOUND'); continue; }
      const cs = getComputedStyle(el);
      out.push(
        `${tag} "${prefix.slice(0, 25)}" => wrap=${cs.textWrap || '?'} align=${cs.textAlign} lines=${Math.round(el.getBoundingClientRect().height / parseFloat(cs.lineHeight || 1))}`
      );
    }
    return out;
  }, SAMPLES);
};
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const a = await PROBE(page, A);
  const b = await PROBE(page, B);
  console.log('A(ref)=' + A);
  a.forEach((l) => console.log('  ' + l));
  console.log('B(port)=' + B);
  b.forEach((l) => console.log('  ' + l));
  await browser.close();
})();
