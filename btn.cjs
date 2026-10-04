// Button/text layer internals: node btn.cjs <url> <needle> [width]
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
    let hit = null;
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if ((n.nodeValue || '').trim().startsWith(needle)) { hit = n; break; }
    }
    if (!hit) return { err: 'not found' };
    let el = hit.parentElement;
    const chain = [];
    for (let p = el; p && chain.length < 6; p = p.parentElement) {
      const cs = getComputedStyle(p);
      const r = p.getBoundingClientRect();
      const rng = document.createRange();
      rng.selectNodeContents(p);
      const lr = rng.getBoundingClientRect();
      chain.push({
        tag: p.tagName.toLowerCase(),
        cls: (p.getAttribute('class') || '').slice(0, 50),
        wc: cs.willChange,
        disp: cs.display, ai: cs.alignItems, ji: cs.justifyContent,
        lh: cs.lineHeight, fs: cs.fontSize, fw: cs.fontWeight, ff: cs.fontFamily.slice(0, 24),
        box: `x${r.x.toFixed(2)} y${(r.y + scrollY).toFixed(2)} w${r.width.toFixed(2)} h${r.height.toFixed(2)}`,
        line: `x${lr.x.toFixed(2)} y${(lr.y + scrollY).toFixed(2)} w${lr.width.toFixed(2)} h${lr.height.toFixed(2)}`,
        tf: cs.transform,
      });
    }
    return { txt: hit.nodeValue.trim().slice(0, 30), chain };
  }, needle);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
