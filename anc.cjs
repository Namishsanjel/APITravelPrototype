// Ancestor chain probe for an element containing a text needle: node anc.cjs <url> <needle> [width]
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
    let el = null;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if ((n.nodeValue || '').trim().includes(needle)) { el = n.parentElement; break; }
    }
    if (!el) return ['not found'];
    const rows = [];
    for (let i = 0; el && i < 12; i++, el = el.parentElement) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      rows.push(
        `${el.tagName.toLowerCase()}.${(el.getAttribute('class') || el.getAttribute('data-framer-name') || '').slice(0, 34)} | ` +
        `y${(r.y + window.scrollY).toFixed(2)} x${r.x.toFixed(2)} | ` +
        `pos:${cs.position} tr:${cs.transform === 'none' ? '-' : cs.transform} fl:${cs.filter === 'none' ? '-' : cs.filter} ` +
        `wc:${cs.willChange} ct:${cs.contain} bl:${cs.backdropFilter === 'none' ? '-' : cs.backdropFilter} ` +
        `fs:${cs.fontSize}/${cs.lineHeight} ff:${cs.fontFamily.slice(0, 26)} fvs:${cs.fontVariationSettings} ` +
        `fw:${cs.fontWeight} ta:${cs.textAlign} ts:${cs.textShadow === 'none' ? '-' : cs.textShadow} ` +
        `op:${cs.opacity} zm:${cs.zoom} w${r.width.toFixed(2)} h${r.height.toFixed(2)}`
      );
    }
    return rows;
  }, needle);
  out.forEach((r) => console.log(r));
  await browser.close();
})();
