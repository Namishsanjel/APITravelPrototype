// Which external requests does the mirror page make, and do they finish?
const { chromium } = require('playwright');
const TARGET = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const reqs = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('http://localhost:8091') && !u.startsWith('data:')) {
      reqs.push({ url: u, done: false, status: null, err: null });
    }
  });
  page.on('response', (r) => {
    const u = r.url();
    const e = reqs.find((x) => x.url === u && !x.done);
    if (e) { e.done = true; e.status = r.status(); }
  });
  page.on('requestfailed', (r) => {
    const u = r.url();
    const e = reqs.find((x) => x.url === u && !x.done);
    if (e) { e.done = true; e.err = r.failure() && r.failure().errorText; }
  });
  try { await page.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch (e) { console.log('goto:', e.message.slice(0, 60)); }
  await page.waitForTimeout(20000);
  const pending = reqs.filter((r) => !r.done);
  console.log('total external:', reqs.length, 'pending:', pending.length);
  const byHost = {};
  for (const r of reqs) {
    const h = new URL(r.url).host;
    byHost[h] = byHost[h] || { n: 0, done: 0 };
    byHost[h].n++;
    if (r.done) byHost[h].done++;
  }
  console.log(JSON.stringify(byHost, null, 1));
  console.log('pending urls:');
  for (const r of pending) console.log('  ' + r.url.slice(0, 130));
  console.log('font-ish responses:');
  for (const r of reqs.filter((r) => /woff|font/i.test(r.url))) console.log('  ' + r.status + ' ' + r.url.slice(0, 130));
  await browser.close();
})();
