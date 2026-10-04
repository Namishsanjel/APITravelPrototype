// Decode the currentSrc of matching imgs independently: node redec.cjs <url> <needle> [width]
const { chromium } = require('playwright');
const [url, needle, vw = '390'] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(vw), height: 900 } });
  const seen = [];
  page.on('response', (r) => { if (/framerusercontent/.test(r.url())) seen.push(`${r.status()} ${r.request().resourceType().padEnd(6)} ${r.url().replace(/^https:\/\/framerusercontent\.com\/images\//, '')}`); });
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
  const out = await page.evaluate(async (needle) => {
    const res = [];
    for (const el of document.querySelectorAll('img')) {
      const hay = (el.currentSrc || '') + ' ' + (el.alt || '');
      if (!hay.includes(needle)) continue;
      const cur = el.currentSrc;
      const i = new Image();
      await new Promise((r) => { i.onload = r; i.onerror = r; i.src = cur; });
      res.push({
        inlineSrc: (el.getAttribute('src') || '').slice(0, 110),
        currentSrc: cur.replace(/^https:\/\/framerusercontent\.com\/images\//, ''),
        elNat: `${el.naturalWidth}x${el.naturalHeight}`,
        redec: `${i.naturalWidth}x${i.naturalHeight}`,
        complete: el.complete,
        attrs: [...el.attributes].map((a) => a.name).join(','),
      });
    }
    return res;
  }, needle);
  out.forEach((r) => console.log(JSON.stringify(r, null, 1)));
  console.log('--- responses ---');
  seen.filter((s) => s.includes(needle)).forEach((s) => console.log(s));
  await browser.close();
})();
