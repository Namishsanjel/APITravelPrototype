// Compare wrap-affecting computed styles for a text snippet (both URLs in one run).
// Usage: node wrapprobe.cjs <text-substring> <url1> <url2>
const { chromium } = require('playwright');
const sub = process.argv[2];
const urls = process.argv.slice(3);
(async () => {
  const browser = await chromium.launch();
  for (const url of urls) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const o = await page.evaluate((sub) => {
      const walk = (el) => {
        for (const c of el.children) {
          const h = walk(c);
          if (h) return h;
        }
        if (el.children.length === 0 && (el.textContent || '').includes(sub)) return el;
        return null;
      };
      const e = walk(document.body);
      if (!e) return { err: 'not found' };
      const cs = getComputedStyle(e);
      // per-line boxes via Range.getClientRects
      const range = document.createRange();
      range.selectNodeContents(e);
      const rects = [...range.getClientRects()].map((r) => `x${r.x.toFixed(1)} y${(r.y + scrollY).toFixed(1)} ${r.width.toFixed(1)}x${r.height.toFixed(1)}`);
      return {
        lines: rects,
        pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        border: `${cs.borderTopWidth}/${cs.borderLeftWidth}`,
        indent: cs.textIndent,
        whiteSpace: cs.whiteSpace,
        wrapStyle: cs.textWrapStyle,
        wrapMode: cs.textWrapMode,
        box: cs.boxSizing,
        display: cs.display,
        width: cs.width,
        inlineSize: cs.inlineSize,
        textSizeAdjust: cs.webkitTextSizeAdjust,
        zoom: cs.zoom,
        fontSynthesis: cs.fontSynthesis,
        textRendering: cs.textRendering,
        fontVariant: cs.fontVariantLigatures,
      };
    }, sub);
    console.log(`--- ${url}`);
    console.log(JSON.stringify(o, null, 1));
    await page.close();
  }
  await browser.close();
})();
