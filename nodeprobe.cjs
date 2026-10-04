const { chromium } = require('playwright');
const URLS = [
  'http://localhost:8091/trova-travel.framer.website/contact.html',
  'http://localhost:5174/contact',
];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const u of URLS) {
    await page.goto(u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const o = await page.evaluate(async () => {
      await document.fonts.ready;
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      const found = [];
      while ((n = walk.nextNode())) {
        if ((n.nodeValue || '').trim().startsWith("Let's")) found.push(n);
      }
      const nodes = found.slice(0, 3).map((tn) => {
        const r = document.createRange();
        r.selectNodeContents(tn);
        const b = r.getBoundingClientRect();
        const el = tn.parentElement;
        const cs = getComputedStyle(el);
        const anc = [];
        let a = el;
        while (a && anc.length < 6) {
          const acs = getComputedStyle(a);
          if (acs.transform !== 'none' || acs.zoom !== '1' || acs.scale !== 'none' || acs.fontStretch !== '100%') {
            anc.push(`${a.tagName}.${(a.className || '').toString().slice(0, 20)} tr=${acs.transform} zoom=${acs.zoom} scale=${acs.scale} stretch=${acs.fontStretch}`);
          }
          a = a.parentElement;
        }
        return {
          val: JSON.stringify(tn.nodeValue),
          rect: [Math.round(b.x * 10) / 10, Math.round((b.y + scrollY) * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10],
          fv: cs.fontVariationSettings,
          fs: cs.fontStretch,
          wSpace: cs.wordSpacing,
          ws: cs.whiteSpace,
          fSynth: cs.fontSynthesis,
          anc,
        };
      });
      return nodes;
    });
    console.log('=== ' + u);
    console.log(JSON.stringify(o, null, 1));
  }
  await browser.close();
})();
