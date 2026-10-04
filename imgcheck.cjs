// Are port images failing or just slow? Poll image states for up to 60s.
// Usage: node imgcheck.cjs <url>
const { chromium } = require('playwright');
const [URL] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch({ args: ['--disable-http2', '--disable-ipv6'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const reqs = { total: 0, failed: 0, finished: 0, byHost: {} };
  page.on('response', (r) => {
    const u = r.url();
    if (!/\.(png|jpe?g|webp)(\?|$)/i.test(u)) return;
    reqs.total++;
    const host = (() => { try { return new URL(u).host; } catch { return '?'; } })();
    reqs.byHost[host] = reqs.byHost[host] || { ok: 0, fail: 0 };
    if (r.status() >= 400) { reqs.failed++; reqs.byHost[host].fail++; }
    else { reqs.finished++; reqs.byHost[host].ok++; }
  });
  page.on('requestfailed', (r) => {
    const u = r.url();
    if (!/\.(png|jpe?g|webp)(\?|$)/i.test(u)) return;
    reqs.failed++;
    const host = (() => { try { return new URL(u).host; } catch { return '?'; } })();
    reqs.byHost[host] = reqs.byHost[host] || { ok: 0, fail: 0 };
    reqs.byHost[host].fail++;
    console.log('REQFAILED', u.slice(0, 90), r.failure()?.errorText);
  });
  const t0 = Date.now();
  try {
    await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  } catch (e) {
    console.log('goto warn:', e.message.slice(0, 80));
  }
  console.log(`load event at ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    const s = await page.evaluate(() => {
      const imgs = [...document.images];
      return {
        total: imgs.length,
        done: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
        failed: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
        pending: imgs.filter((i) => !i.complete).length,
      };
    });
    console.log(`${((Date.now() - t0) / 1000).toFixed(0)}s`, JSON.stringify(s));
    if (s.pending === 0) break;
  }
  console.log('responses:', JSON.stringify(reqs));
  await browser.close();
})();
