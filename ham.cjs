const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:8091/trova-travel.framer.website/contact.html', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const o = await p.evaluate(() => {
    const btns = [...document.querySelectorAll('nav *')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 30 && r.width < 46 && r.height > 30;
    });
    return btns.map((e) => e.outerHTML.slice(0, 1500));
  });
  console.log(o.join('\n\n----\n\n'));
  await b.close();
})();
