// Compare footer landmark rects between two URLs (ref vs port) to localize
// fractional height drift. Usage: node footerdrift.cjs <urlA> <urlB>
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2);

const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const r = (e) => {
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return { y: +(b.y + scrollY).toFixed(3), h: +b.height.toFixed(3), w: +b.width.toFixed(3), x: +b.x.toFixed(3) };
    };
    const byText = (sel, t) => [...document.querySelectorAll(sel)].find((e) => (e.textContent || '').trim().startsWith(t));
    const bgImg = [...document.images].find((i) => i.src.includes('tbrfdtrrgnt'));
    const logoW = [...document.images].filter((i) => i.src.includes('logo-white'));
    // bottom-most element edge in the document
    let maxY = 0, maxEl = '';
    for (const e of document.querySelectorAll('body *')) {
      const b = e.getBoundingClientRect();
      const bot = b.y + scrollY + b.height;
      if (bot > maxY && b.height > 0) {
        maxY = bot;
        maxEl = e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0];
      }
    }
    return {
      scrollH: document.documentElement.scrollHeight,
      bodyH: document.body.getBoundingClientRect().height,
      bgImg: r(bgImg),
      bgImgNatural: bgImg ? `${bgImg.naturalWidth}x${bgImg.naturalHeight}` : null,
      logoWhite: logoW.map(r),
      copyright: r(byText('div', '\u00a9 2026')),
      navCol: r(byText('*', 'Navigation')),
      ctaH2: r(byText('h2', 'Your next adventure')),
      exploreBtn: r(byText('a', 'Explore Hikes')),
      maxEdge: { y: +maxY.toFixed(3), el: maxEl },
    };
  });
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const a = await PROBE(page, A);
  const b = await PROBE(page, B);
  const keys = Object.keys(a);
  console.log('A=' + A);
  console.log('B=' + B);
  for (const k of keys) {
    const sa = JSON.stringify(a[k]);
    const sb = JSON.stringify(b[k]);
    console.log((sa === sb ? 'SAME ' : 'DIFF ') + k + '\n   A: ' + sa + '\n   B: ' + sb);
  }
  await browser.close();
})();
