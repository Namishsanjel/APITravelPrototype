const { chromium } = require('playwright');
const U = [
  'http://localhost:8091/trova-travel.framer.website/contact.html',
  'http://localhost:5174/contact',
];
(async () => {
  const b = await chromium.launch();
  for (const u of U) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    await p.goto(u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(2000);
    const o = await p.evaluate(() => {
      const q = document.querySelector('h5');
      // walk up to the accordion container, then list its children
      let acc = q;
      for (let i = 0; i < 6 && acc; i++) {
        acc = acc.parentElement;
        if (acc && acc.getBoundingClientRect().height > 400 && acc.getBoundingClientRect().width > 300) break;
      }
      const r = (e) => {
        const b = e.getBoundingClientRect();
        return `${(b.y + scrollY).toFixed(2)} h=${b.height.toFixed(2)} x=${b.x.toFixed(2)} w=${b.width.toFixed(2)}`;
      };
      const out = { acc: acc ? r(acc) + ' ' + (acc.className || '').toString().slice(0, 30) : 'none', kids: [] };
      if (acc) {
        for (const k of acc.children) {
          out.kids.push(`${k.tagName}.${(k.className || '').toString().slice(0, 24)} ${r(k)}`);
          for (const kk of k.children) out.kids.push(`   >${kk.tagName}.${(kk.className || '').toString().slice(0, 20)} ${r(kk)}`);
        }
      }
      const h5 = document.querySelector('h5');
      out.h5 = r(h5);
      const ans = [...document.querySelectorAll('p')].find((e) => e.getBoundingClientRect().height > 30 && (e.textContent || '').includes('If you can walk'));
      if (ans) out.ans = r(ans);
      return out;
    });
    console.log('=== ' + u);
    console.log(JSON.stringify(o, null, 1));
    await p.close();
  }
  await b.close();
})();
