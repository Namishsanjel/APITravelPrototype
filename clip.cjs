// Clipped screenshot: node clip.cjs <url> <x> <y> <w> <h> <scale> <out> [width]
const { chromium } = require('playwright');
const [url, x, y, w, h, scale, out, vw] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: Number(vw || 1440), height: 900 },
    deviceScaleFactor: Number(scale || 2),
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
  await page.screenshot({
    path: out,
    clip: { x: Number(x), y: Number(y), width: Number(w), height: Number(h) },
  });
  console.log('saved', out);
  await browser.close();
})();
