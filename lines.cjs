// Per-line text of the story paragraph, ref vs port.
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2);
const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const h = [...document.querySelectorAll('h4, p, div')].find(
      (e) => e.children.length === 0 && (e.textContent || '').startsWith('API Touch began with a handful')
    );
    if (!h) return 'NOT FOUND';
    const node = h.firstChild;
    const text = node.textContent;
    const range = document.createRange();
    const lines = [];
    let curTop = null;
    let start = 0;
    for (let i = 1; i <= text.length; i++) {
      range.setStart(node, i - 1);
      range.setEnd(node, i);
      const rects = range.getClientRects();
      if (!rects.length) continue;
      const top = Math.round(rects[0].top);
      if (curTop === null) curTop = top;
      else if (top !== curTop) {
        lines.push(text.slice(start, i - 1));
        start = i - 1;
        curTop = top;
      }
    }
    lines.push(text.slice(start));
    return { textWrap: getComputedStyle(h).textWrap || getComputedStyle(h).textWrapStyle, lines };
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
