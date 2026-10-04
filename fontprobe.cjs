// Enumerate @font-face rules (family/weight/src) on ref and port pages.
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2);
const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const out = [];
    for (const sheet of [...document.styleSheets]) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of [...rules]) {
        if (rule instanceof CSSFontFaceRule) {
          const src = rule.style.getPropertyValue('src') || '';
          const m = src.match(/url\((['"]?)([^'")]+)\1\)/);
          out.push({
            family: rule.style.getPropertyValue('font-family').replace(/['"]/g, ''),
            weight: rule.style.getPropertyValue('font-weight'),
            style: rule.style.getPropertyValue('font-style'),
            url: m ? m[2] : src.slice(0, 60),
          });
        }
      }
    }
    return out;
  });
};
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const a = await PROBE(page, A);
  const b = await PROBE(page, B);
  console.log('A(ref)=' + A);
  a.forEach((r) => console.log('  ' + JSON.stringify(r)));
  console.log('B(port)=' + B);
  b.forEach((r) => console.log('  ' + JSON.stringify(r)));
  await browser.close();
})();
