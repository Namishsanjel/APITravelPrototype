// Element screenshot at 2x scale: node elshot.cjs <url> <selector-x-path-ish name> <out> [width]
const { chromium } = require('playwright');
const [url, name, out, width] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: Number(width || 1440), height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 60); else { window.scrollTo(0, 0); setTimeout(res, 400); } };
      s();
    });
  });
  await page.waitForTimeout(2500);
  const handle = await page.evaluateHandle((name) => {
    const els = [...document.querySelectorAll('*')];
    return els.find((e) => (e.getAttribute('data-framer-name') || '').trim() === name && e.getBoundingClientRect().width > 40)
      || document.body;
  }, name);
  const el = handle.asElement();
  await el.screenshot({ path: out });
  console.log('saved', out);
  await browser.close();
})();
