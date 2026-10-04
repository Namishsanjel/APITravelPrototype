// Deep-compare story h4 text metrics: ref vs port (handles hydrated word-spans).
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2);

const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);
  return page.evaluate(() => {
    // deepest element containing the story text
    const els = [...document.querySelectorAll('h4')].filter((e) =>
      (e.textContent || '').trim().startsWith('What started as informal')
    );
    if (!els.length) return { err: 'h4 not found' };
    const el = els[els.length - 1];
    const cs = getComputedStyle(el);
    // measure a fixed string using a detached span with the element's font
    const span = document.createElement('span');
    span.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font:${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily};letter-spacing:${cs.letterSpacing};word-spacing:${cs.wordSpacing};text-transform:${cs.textTransform};font-kerning:${cs.fontKerning};font-variant:${cs.fontVariantLigatures};font-feature-settings:${cs.fontFeatureSettings};font-variation-settings:${cs.fontVariationSettings};`;
    span.textContent = 'Every trail we offer has been walked';
    document.body.appendChild(span);
    const w = span.getBoundingClientRect().width;
    span.remove();
    // line boxes via Range rects
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()];
    const lineTops = [...new Set(rects.map((r) => Math.round(r.top * 10) / 10))];
    return {
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      fontSize: cs.fontSize,
      letterSpacing: cs.letterSpacing,
      wordSpacing: cs.wordSpacing,
      textWrap: cs.textWrap,
      lineHeight: cs.lineHeight,
      textAlign: cs.textAlign,
      fontFeature: cs.fontFeatureSettings,
      fontVariation: cs.fontVariationSettings,
      testWidth: Math.round(w * 100) / 100,
      lines: lineTops.length,
      lineTops: lineTops.slice(0, 8),
      rect: JSON.parse(JSON.stringify(el.getBoundingClientRect())),
      fontsCabinet500: document.fonts.check('500 24px "Cabinet Grotesk"'),
      fontsCabinet: [...document.fonts].filter((f) => f.family.includes('Cabinet')).map((f) => `${f.family}|${f.weight}|${f.status}`),
    };
  });
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const a = await PROBE(page, A);
  const b = await PROBE(page, B);
  console.log('A(ref)=', JSON.stringify(a, null, 1));
  console.log('B(port)=', JSON.stringify(b, null, 1));
  await browser.close();
})();

