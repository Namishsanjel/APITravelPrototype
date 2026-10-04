// natural size of remote image URLs: node imgsz.cjs <url> [<url> ...]
const { chromium } = require('playwright');
const urls = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = await page.evaluate(async (urls) => {
    const out = [];
    for (const u of urls) {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      const p = new Promise((r) => { i.onload = () => r('ok'); i.onerror = () => r('err'); });
      i.src = u;
      const st = await p;
      out.push(`${st} ${i.naturalWidth}x${i.naturalHeight}  ${u}`);
    }
    return out;
  }, urls);
  res.forEach((l) => console.log(l));
  await browser.close();
})();
