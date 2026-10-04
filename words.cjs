// Word-level positions for text nodes: node words.cjs <url> <needle>
const { chromium } = require('playwright');
const [url, needle] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 50); else { window.scrollTo(0, 0); setTimeout(res, 400); } };
      s();
    });
  });
  await page.waitForTimeout(1500);
  const out = await page.evaluate((needle) => {
    const res = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if ((n.nodeValue || '').trim().startsWith(needle)) nodes.push(n);
    }
    for (const tn of nodes.slice(0, 4)) {
      const text = tn.nodeValue;
      const words = [];
      const re = /\S+/g;
      let m;
      while ((m = re.exec(text))) {
        const r = document.createRange();
        r.setStart(tn, m.index);
        r.setEnd(tn, m.index + m[0].length);
        const b = r.getBoundingClientRect();
        words.push(`${m[0]}@${Math.round(b.x)},${Math.round(b.y + scrollY)},${Math.round(b.width)}`);
      }
      const el = tn.parentElement;
      const cs = getComputedStyle(el);
      res.push({
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 40),
        ff: cs.fontFamily.slice(0, 30),
        fs: cs.fontSize,
        lh: cs.lineHeight,
        fw: cs.fontWeight,
        ls: cs.letterSpacing,
        words: words.join(' '),
      });
    }
    return res;
  }, needle);
  out.forEach((r) => console.log(JSON.stringify(r, null, 1)));
  await browser.close();
})();
