// Font metrics for text nodes matching a needle: node fm.cjs <url> <needle> [width]
const { chromium } = require('playwright');
const [url, needle, vw = '390'] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(vw), height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 60); else { window.scrollTo(0, 0); setTimeout(res, 400); } };
      s();
    });
  });
  await page.waitForTimeout(1500);
  const out = await page.evaluate((needle) => {
    const res = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!(n.nodeValue || '').trim().startsWith(needle)) continue;
      const el = n.parentElement;
      const cs = getComputedStyle(el);
      const r = document.createRange();
      r.selectNodeContents(n);
      const lr = r.getBoundingClientRect();
      res.push({
        text: n.nodeValue.trim().slice(0, 40),
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 45),
        ff: cs.fontFamily.slice(0, 34),
        fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight, fst: cs.fontStyle,
        fvs: cs.fontVariationSettings, fstretch: cs.fontStretch, ls: cs.letterSpacing,
        ws: cs.wordSpacing, ta: cs.textAlign, tw: cs.textWrap, fopt: cs.fontOpticalSizing,
        ffeat: cs.fontFeatureSettings, tc: cs.textTransform,
        wc: cs.willChange, op: cs.opacity, col: cs.color,
        rect: `x${lr.x.toFixed(2)} y${(lr.y + scrollY).toFixed(2)} w${lr.width.toFixed(2)} h${lr.height.toFixed(2)}`,
      });
    }
    return res.slice(0, 3);
  }, needle);
  out.forEach((r) => console.log(JSON.stringify(r)));
  await browser.close();
})();
