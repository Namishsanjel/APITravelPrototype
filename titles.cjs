const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const u of process.argv.slice(2)) {
    await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(1500);
    const t = await p.title();
    const d = await p.evaluate(() => {
      const m = document.querySelector('meta[name="description"]');
      return m ? m.content : '';
    });
    console.log(u, '\n  title:', JSON.stringify(t), '\n  desc :', JSON.stringify(d));
  }
  await b.close();
})();
